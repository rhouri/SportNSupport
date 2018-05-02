using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SNS.API
   {
   public partial class Subject
      {
      public List<Match> RequestMatches
         {
         get; set;
         }
      public List<Match> OffersMatches
         {
         get; set;
         }
      public bool Requested
         {
         get; set;
         }
      public bool Offered
         {
         get; set;
         }
      }

   }