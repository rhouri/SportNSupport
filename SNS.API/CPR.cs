using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using System.Configuration;
using Microsoft.Win32;


using System.Web;
using System.Diagnostics;

namespace SNS.API
    {

    /// <summary>
    /// Not thread safe.
    /// </summary>
    /// 

    public static class CPR
        {
        // Filter extensions
        private static SNSEntities xSNSE = null;

        public static SNSEntities SNSE
            {
            get
                {
                if (xSNSE == null)
                    {
                    xSNSE = new SNSEntities();
                    xSNSE.Configuration.LazyLoadingEnabled = false;
                    // xSNSE.Configuration.ProxyCreationEnabled = false;
                    // xSNSE.Configuration.AutoDetectChangesEnabled = false;
                    xSNSE.Database.Log = s => Debug.WriteLine(s);
                    }
                return xSNSE;
                }
            }

        /// <summary>
        /// Called automatically on Application_EndRequest()
        /// </summary>
        public static void DisposeDbCPR ()
            {
             xSNSE.Dispose();
            }

        }
    }
