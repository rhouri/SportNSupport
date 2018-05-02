(function ()
{
    angular
      .module('validation.rule', ['validation'])
      .config(['$validationProvider', function ($validationProvider)
      {
          var expression = {
              
              url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
              email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
              number: /^\d+$/,
              minlength: function (value, scope, element, attrs, param)
              {
                  return value.length >= param;
              },
              maxlength: function (value, scope, element, attrs, param)
              {
                  return value.length <= param;
              }

              //////////////////////////////////////////////////////////////////
              // Custom Validators                 
              //////////////////////////////////////////////////////////////////

              , creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\\d{3})\\d{11})$/
              , iban: /^[a-zA-Z]{2}\\d{2}\\s?([0-9a-zA-Z]{4}\\s?){4}[0-9a-zA-Z]{2}$/
              , integer: /^\\d+$/
              , numeric: /^\\d*\\.?\\d+$/

              , Password: function (s, scope, element, attrs, param)
                    {
                    if (!s)
                        return false;
                    var valid = s.length >= 8;
                    var re = /[!@#$%&*()_+=|<>?{}~-]/;
                    var t = re.test(s);
                    re = /[\[\]]/;
                    t = t || re.test(s);
                    valid = valid && t;
                    re = /[0-9]/;
                    valid = valid && re.test(s);
                    re = /[A-Z]/;
                    valid = valid && re.test(s);
                    return valid;
                    }




              , match: // get the element 'value' ngModel to compare to (passed as params[0], via an $eval('ng-model="modelToCompareName"')
                    function (strValue, scope, element, attrs, validatorParam)
                    {
                        var otherNgModel = validatorParam;
                        var otherNgModelVal = scope.$eval(otherNgModel);
                        return (otherNgModelVal === strValue && !!strValue);
                    }


              ,remote: function (strValue, scope, element, attrs, validatorParam)
              {
                  if (!!strValue)
                  {
                      var fct = null;
                      var pp = validatorParam.split('\\');
                      var fname = pp[0];
                      fct = scope[fname];
                      $validationProvider.setExpression('remote').setDefaultMsg(pp[2]);

                      if (typeof fct === "function")
                          return fct(strValue, pp);
                  }
                  return true;

              }
            
               , required: function (s, scope, element, attrs, validatorParam)
                  {
                      return !!s;
               }

               , requiredDate: function (s, scope, element, attrs, validatorParam)
               {
                   return Date.parse(s);
               }
               , phoneUSA: /1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?(\d*))?/
               , zipcodeUSA: /\d{5}\d{4}$|^\d{5}$/
               , SSN: /^\d{3}-?\d{2}-?\d{4}$/
               , SWIFT: /^([a-zA-Z]){4}([a-zA-Z]){2}([0-9a-zA-Z]){2}([0-9a-zA-Z]{3})?$/
               , CNPostalCode: /^((\d{5}-\d{4})|(\d{5})|([A-Z]\d[A-Z]\s\d[A-Z]\d))$/
               , requiredFormula: function (s, scope, element, attrs, validatorParam)
               {
                   var t = scope._CC.Calc(attrs.validationFieldRequired);
                   if (t)
                       return !!s;
                   else
                       return true;
               }
               , ABACheckDigit: function (s, scope, element, attrs, validatorParam)
               {
                   var c, k, n, t;
                   // First, remove any non-numeric characters.
                   t = "";
                   for (k = 0; k < s.length; k++)
                   {
                       c = parseInt(s.charAt(k), 10);
                       if (c >= 0 && c <= 9)
                           t = t + c;
                   }
                   // Check the length, it should be nine digits.
                   if (t.length != 9)
                       return false;
                   // Now run through each digit and calculate the total.
                   n = 0;
                   for (k = 0; k < t.length; k += 3)
                   {
                       n += parseInt(t.charAt(k), 10) * 3
                          + parseInt(t.charAt(k + 1), 10) * 7
                          + parseInt(t.charAt(k + 2), 10);
                   }
                   // If the resulting sum is an even multiple of ten (but not zero),
                   // the aba routing number is good.
                   if (n != 0 && n % 10 == 0)
                       return true;
                   else
                       return false;
               }
             , LessEqualCashRemaining: function (value, scope, element, attrs, validatorParam)
             {
                 var v = parseFloat(value.replace(",", "").replace("$", ""));
                 return valueBetween(v, 0.01, scope.UIData.CashRemaining);
             }

              , LessEqualPreTaxRemaining: function (value, scope, element, attrs, validatorParam)
              {
                  var v = parseFloat(value.replace(",", "").replace("$", ""));
                  return valueBetween(v, 0.0, scope.UIData.di.ParticipantAccount.PreTaxRemaining);
              }

              , LessEqualPostTaxRemaining: function (value, scope, element, attrs, validatorParam)
              {
                  var v = parseFloat(value.replace(",", "").replace("$", ""));
                  return valueBetween(v, 0.0, scope.UIData.di.ParticipantAccount.PostTaxRemaining);
              }

              , CurrentYearOrLater: function (value, scope, element, attrs, validatorParam)
              {
                  var dref = new Date();
                  var d = new Date(value);
                  return d.getFullYear() >= dref.getFullYear();
              }
              , InThePast: function (value, scope, element, attrs, validatorParam)
              {
                  var dref = new Date();
                  var d = new Date(value);
                  return d < dref
              }

              , positive: function (value, scope, element, attrs, validatorParam)
              {

                  var f = parseFloat(value.replace(",", "").replace("$", ""))
                  return f >= 0;
              }
              , NotZero: function (value, scope, element, attrs, validatorParam)
              {
                  var f = parseFloat(value.replace(",", "").replace("$", ""))
                  return f != 0;
              }

              //////////////////////////////////////////////////////////////////
              // End Custom Validators                 
              //////////////////////////////////////////////////////////////////

          }



          var defaultMsg = {
              required: {
                  error: 'Required Item!',
                  //success: 'OK'
              },
              url: {
                  error: 'Invalid Url',
                  //success: ''
              },
              email: {
                  error: 'Invalid Email',
                  //success: 'It\'s Email'
              },
              number: {
                  error: 'Not a Number',
                  //success: 'It\'s Number'
              },
              minlength: {
                  error: 'Not Long Enough',
                  //success: 'Long enough!'
              },
              maxlength: {
                  error: 'Too Long',
                  //success: 'Short enough!'
              },


              //////////////////////////////////////////////////////////////////
              // Custom Validators                 
              //////////////////////////////////////////////////////////////////

              creditCard: {
                  error: "Invalid Credit Card Number",
              }

             , iban:
             {
                 error: "Invalid IBAN code"

             }
            ,
              integer:
                  {
                      error: "Must be integer"
                  }
                ,
              numeric:
                  {
                      error: "Invalid Number"
                  },


              match:
                  {
                      error:'Does not match!'
                  },
              remote:
                  {
                      error: 'Email aleready in use'
                  },
              required:
                  {
                      error: "Required"
                  },
              requiredDate :
                  {
                      error:'Date is required'
                  },
              phoneUSA:
                  {
                      error: "Invalid US Phone #"
                  },


              zipcodeUSA: {
                  error: "Invalid US ZIP Code"
              },

              SSN: {
                  error: 'Invalid SSN.'
              },

              SWIFT: {
                  error: 'Invalid SWIFT code.'
              },


              CNPostalCode: {
                  error: 'Please enter a valid US or Canadian postal code.'
              },



              requiredFormula: {
                  error: "Required"
              },


              ABACheckDigit: {
                  error: "Invalid ABA #"
              },

              LessEqualCashRemaining:
                     {
                         error: "Amount should be less or equal to remaining cash."
                     },

              LessEqualPreTaxRemaining:
                     {
                         error: "Amount should be less or equal to remaining Pre-Tax amount."
                     },

              LessEqualPostTaxRemaining:
                     {
                         error: "Amount should be less or equal to remaining Post-Tax amount."
                     },

              CurrentYearOrLater:
                      {
                          error: "Date must be this Year or later."
                      },

              InThePast: {
                  error: "Date must be past."
              },

              positive: {
                  error: "must be positive Number"
              },

              NotZero: {
                  error: "must be positive Number"
              },

              Password: {error:"Invalid Password"}


          };
          //////////////////////////////////////////////////////////////////
          // End Custom Validators                 
          //////////////////////////////////////////////////////////////////

          $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
          $validationProvider.showSuccessMessage = false; // or true(default)


      }]);
}).call(this);
