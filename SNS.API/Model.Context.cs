﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace SNS.API
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class SNSEntities : DbContext
    {
        public SNSEntities()
            : base("name=SNSEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<AspNetUser> AspNetUsers { get; set; }
        public virtual DbSet<Contact> Contacts { get; set; }
        public virtual DbSet<School> Schools { get; set; }
        public virtual DbSet<Student> Students { get; set; }
        public virtual DbSet<SubjectCategory> SubjectCategories { get; set; }
        public virtual DbSet<StudentOffer> StudentOffers { get; set; }
        public virtual DbSet<StudentRequest> StudentRequests { get; set; }
        public virtual DbSet<StudentTeam> StudentTeams { get; set; }
        public virtual DbSet<Subject> Subjects { get; set; }
        public virtual DbSet<Team> Teams { get; set; }
    
        public virtual ObjectResult<findPupils_Result> findPupils(Nullable<int> sid)
        {
            var sidParameter = sid.HasValue ?
                new ObjectParameter("sid", sid) :
                new ObjectParameter("sid", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<findPupils_Result>("findPupils", sidParameter);
        }
    
        public virtual ObjectResult<findTutors_Result> findTutors(Nullable<int> sid)
        {
            var sidParameter = sid.HasValue ?
                new ObjectParameter("Sid", sid) :
                new ObjectParameter("Sid", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<findTutors_Result>("findTutors", sidParameter);
        }
    }
}
