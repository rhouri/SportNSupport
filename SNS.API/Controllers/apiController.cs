using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Web.Http;
using System.Threading.Tasks;

namespace SNS.API
    {

    public class BaseWebApi :ApiController
        {

        protected string UserName;
        protected string StudentName;
        protected int StudentID;

        public void getCurrentUser ()
            {
            ClaimsPrincipal principal = Request.GetRequestContext().Principal as ClaimsPrincipal;

            var Name = ClaimsPrincipal.Current.Identity.Name;
            var Name1 = User.Identity.Name;
            UserName = principal.Claims.Where(c => c.Type == "sub").Single().Value;
            }

        public static HttpResponseMessage GetHttpException ( Exception e )
            {
            HttpResponseMessage Em = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            Em.ReasonPhrase = DataHelper.getEFException(e);
            return Em;
            }

        }

    [Authorize]
    public class ModelController :BaseWebApi
        {

        [AllowAnonymous]
        [HttpGet]
        public async Task<IHttpActionResult> doesUserNameExist ( string Param )
            {
            var user = await CPR.SNSE.AspNetUsers.Where(u => u.UserName == Param).AsNoTracking().FirstOrDefaultAsync();
            return Ok(user != null);
            }




        [HttpGet]
        public async Task<IHttpActionResult> StudentTeamsList ()
            {
            try
                {
                var L = await CPR.SNSE.Teams.Include(t => t.School).Include(t => t.StudentTeams.Select(s => s.Student)).AsNoTracking().ToListAsync();
                return Ok(L);
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                ;
                }
            }




        [AllowAnonymous]
        [HttpGet]
        public async Task<IHttpActionResult> SchoolList ()
            {
            try
                {
                var L = await CPR.SNSE.Schools.AsNoTracking().ToListAsync();
                return Ok(L);
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                }
            }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IHttpActionResult> SchoolTeamsList ( string Param )
            {
            try
                {
                var s = int.Parse(Param);
                var L = await CPR.SNSE.Teams.Where(t => t.SchoolID == s).AsNoTracking().ToListAsync();
                return Ok(L);
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                }
            }


        protected async Task<List<Subject>> GetStudentMatches ( int studentID )
            {
            List<Subject> SL = await CPR.SNSE.Subjects.Include(s => s.StudentOffers).Include(s => s.StudentRequests).OrderBy(s => s.SubjectName).AsNoTracking().ToListAsync();

            ////////////////////////////
            // Match My Requests
            ////////////////////////////

            List<findTutors_Result> R = await Task.Run(() => CPR.SNSE.findTutors(studentID).ToList());
            foreach (findTutors_Result tt in R)
                {
                Subject S1 = SL.Where(s => s.ID == tt.SubjectID).First();
                if (S1.RequestMatches == null)
                    S1.RequestMatches = new List<Match>();
                S1.RequestMatches.Add(new Match(studentID, tt.StudentID, tt.SubjectID));
                }



            ////////////////////////////////////////////////
            // Match my offers to other students requests
            ///////////////////////////////////////////////
            List<findPupils_Result> P = await Task.Run(() => CPR.SNSE.findPupils(studentID).ToList());
            foreach (findPupils_Result tt in P)
                {
                Subject S1 = SL.Where(s => s.ID == tt.SubjectID).First();
                if (S1.OffersMatches == null)
                    S1.OffersMatches = new List<Match>();
                S1.OffersMatches.Add(new Match(studentID, tt.StudentID, tt.SubjectID));
                }

            return SL;
            }

        [HttpPost]
        public async Task<IHttpActionResult> GetMatchData ( string Param, [FromBody] Subject su )
            {

            try
                {
                wrapper<MatchResult> Result = new wrapper<MatchResult>();
                List<MatchResult> LMR = new List<MatchResult>();
                Result.List = LMR;

                // which match are we looking for?
                List<Match> L1 = (Param == "1") ? su.OffersMatches : su.RequestMatches;

                int S1ID = L1.First().thisStudentID; // the sutend offering or requesting
                List<int> S1Teams = await CPR.SNSE.StudentTeams.Where(t => t.StudentID == S1ID).Select(t => t.TeamID).ToListAsync();

                foreach (Match M in L1)
                    {
                    MatchResult MR = new MatchResult();
                    Student ST = CPR.SNSE.Students.Where(s => s.ID == M.StudentID).Include(s => s.Contact).FirstOrDefault();
                    MR.LastName = ST.Contact.LastName;
                    MR.FirstName = ST.Contact.FirstName;
                    // find the teams that student is in 
                    List<int> STTeams = CPR.SNSE.StudentTeams.Where(t => t.StudentID == ST.ID).Select(t => t.TeamID).ToList();
                    var SameTeams = STTeams.Intersect(S1Teams);
                    foreach (int tid in SameTeams)
                        {
                        MR.TeamName += CPR.SNSE.Teams.Where(t => t.ID == tid).Select(t => t.TeamName).First();
                        MR.TeamName += ",";
                        }

                    MR.Subject = su.SubjectName;
                    LMR.Add(MR);
                    }

                return Ok(Result);
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                ;
                }
            }




        [HttpPost]
        public async Task<IHttpActionResult> SaveStudent ( string Param, [FromBody] Student su ) // AccountID is DSID 
            {
            try
                {
                Student OS = await CPR.SNSE.Students.Where(s => s.ID == su.ID)
                   .Include(s => s.StudentRequests)
                   .Include(s => s.StudentOffers)
                   .Include(s => s.StudentTeams)
                   .FirstOrDefaultAsync();

                // Deal with requests
                // remove all student requests
                CPR.SNSE.StudentRequests.RemoveRange(OS.StudentRequests);

                foreach (StudentRequest S in su.StudentRequests)
                    OS.StudentRequests.Add(S);

                // Deal with Offers
                // remove all student Offers
                CPR.SNSE.StudentOffers.RemoveRange(OS.StudentOffers);


                foreach (StudentOffer S in su.StudentOffers)
                    OS.StudentOffers.Add(S);

                CPR.SNSE.StudentTeams.RemoveRange(OS.StudentTeams);

                foreach (StudentTeam S in su.StudentTeams)
                    OS.StudentTeams.Add(S);

                await CPR.SNSE.SaveChangesAsync();

                return Ok(su);
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                ;
                }
            }

        [HttpGet]
        public async Task<IHttpActionResult> GetMatches ( string Param )
            {
            try
                {
                var sid = RequestContext.Principal.Identity.Name;
                webData WD = new webData();
                WD.user = await CPR.SNSE.AspNetUsers.Where(u => u.UserName == sid).AsNoTracking().FirstAsync();
                Student student = CPR.SNSE.Students.Where(s => s.SecID == WD.user.Id)
                  .AsNoTracking()
                  .FirstOrDefault();

                return Ok(GetStudentMatches(student.ID));
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                ;
                }
            }

        [HttpGet]
        public async Task<IHttpActionResult> GetData ( string Param )
            {
            try
                {
                var sid = RequestContext.Principal.Identity.Name;
                webData WD = new webData();
                WD.user = CPR.SNSE.AspNetUsers.Where(u => u.UserName == sid).AsNoTracking().First();
                WD.student = CPR.SNSE.Students.Where(s => s.SecID == WD.user.Id)
                      .Include(s => s.StudentTeams)
                  .Include(s => s.StudentOffers)
                  .Include(s => s.StudentRequests)
                  .Include(s => s.Contact)
                  .AsNoTracking().FirstOrDefault();

                WD.subjects = await  GetStudentMatches(WD.student.ID);

                WD.categories = CPR.SNSE.SubjectCategories.OrderBy(s => s.CategoryName).AsNoTracking().ToList();
                int? teamID = WD.student.StudentTeams.Select(s => s.TeamID).FirstOrDefault();
                if (teamID != null)
                    {
                    Team ATeam = CPR.SNSE.Teams.Where(t => t.ID == teamID).Include(t => t.School).AsNoTracking().First();
                    WD.school = ATeam.School;
                    }
                WD.teams = CPR.SNSE.Teams.Where(t => t.SchoolID == WD.school.ID).AsNoTracking().ToList();

                return Ok(WD);
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                ;
                }
            }

        [HttpGet]
        public async Task<IHttpActionResult> GetSubjects ( string Param )
            {
            try
                {
                var sid = RequestContext.Principal.Identity.Name;
                AspNetUser U = await CPR.SNSE.AspNetUsers.Where(u => u.UserName == sid).AsNoTracking().FirstAsync();
                List<Subject> L = await CPR.SNSE.Subjects.AsNoTracking().ToListAsync();
                return Ok(L);
                }
            catch (Exception e)
                {
                return Content(HttpStatusCode.InternalServerError, e.Message);
                ;
                }
            }


        }




    public class webData
        {
        public AspNetUser user
            {
            get; set;
            }

        public Student student
            {
            get; set;
            }


        public List<SubjectCategory> categories
            {
            get; set;
            }
        public List<Subject> subjects
            {
            get; set;
            }

        public List<Team> teams
            {
            get; set;
            }
        public School school
            {
            get; set;
            }

        }



    // xref the requests with found offers


    public class Match
        {

        public int thisStudentID
            {
            get; set;
            }
        public int StudentID
            {
            get; set;
            }
        public int TeamID
            {
            get; set;
            }

        public Match ( int thisID, int stId, int tId )
            {
            this.thisStudentID = thisID;
            this.StudentID = stId;
            this.TeamID = tId;
            }
        }


    public class MatchResult
        {
        public string FirstName
            {
            get; set;
            }
        public string LastName
            {
            get; set;
            }

        public string TeamName
            {
            get; set;
            }
        public string Subject
            {
            get; set;
            }
        }


    public class wrapper<T>
        {
        public List<T> List
            {
            get; set;
            }
        }


    public static class DataHelper
        {
        public static string getEFException ( Exception e )
            {

            StringBuilder LE = new StringBuilder();
            LE.Append(e.Message + "<br/>");
            if (e is DbEntityValidationException)
                {
                foreach (var validationErrors in (e as DbEntityValidationException).EntityValidationErrors)
                    {
                    foreach (var validationError in validationErrors.ValidationErrors)
                        {
                        LE.Append(string.Format("<br/>Property: {0} Error: {1}", validationError.PropertyName, validationError.ErrorMessage));
                        }
                    }
                }
            else
                while (e.InnerException != null)
                    {
                    LE.Append("<br/>" + e.InnerException.Message);
                    e = e.InnerException;
                    }
            return LE.ToString().Replace("\n\r", "<br/>").Replace("\n", "<br/>").Replace("\r", "<br/>");
            }
        }
    }