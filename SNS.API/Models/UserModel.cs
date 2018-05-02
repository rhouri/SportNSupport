using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SNS.API.Models
{
    public class UserModel
    {
        public string UserName { get; set; }

        public string Password { get; set; }

        public string ConfirmPassword { get; set; }

      public int SchoolID {
         get; set;
         }
      public List<Team> Teams {
         get; set;
         }
      public string LastName
         {
         get; set;
         }
      public string FirstName
         {
         get; set;
         }
      public int Grade
         {
         get; set;
         }
      }
}