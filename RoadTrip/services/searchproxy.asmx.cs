using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using Newtonsoft.Json;

namespace RoadTrip.services
{
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService]
    public class searchproxy : WebService
    {
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string GetBusinessTypesAtLocation(string search, double lat, double lng)
        {
            var country = GetCountryFromCoordinates(lat, lng);
            if (country == "USA")
            {
                var result = GetUSABusinessTypesAtLocation(search, lat, lng);
                return JsonConvert.SerializeObject(result);
            }
            else
            {
                var result = GetCanadaBusinessTypesAtLocation(search, lat, lng);
                return JsonConvert.SerializeObject(result);
            }
        }

        private object GetCountryFromCoordinates(double lat, double lng)
        {
            WebClient client = new WebClient();
            var address = string.Format("http://maps.googleapis.com/maps/api/geocode/json?latlng={0},{1}&sensor=false", lat, lng);
            var result = client.DownloadString(address);
            var anon = new
                           {
                               results = new[]
                                             {
                                                 new
                                                     {
                                                         formatted_address = string.Empty
                                                     }
                                             }
                           };
            var data = JsonConvert.DeserializeAnonymousType(result, anon);
            return data.results.Length > 0 && data.results[0].formatted_address.Contains("USA") ? "USA" : "Canada";
        }

        private Stop[] GetUSABusinessTypesAtLocation(string search, double lat, double lng)
        {
            WebClient client = new WebClient();
            var address = string.Format("http://local.yahooapis.com/LocalSearchService/V3/localSearch?appid=sF3Co34a&query={0}&results=5&radius=32&latitude={1}&longitude={2}&output=json",
                search, lat, lng);
            var result = client.DownloadString(address);
            var anon = new
                           {
                               ResultSet = new
                                               {
                                                   Result = new[]
                                                                {
                                                                    new
                                                                        {
                                                                            id = string.Empty,
                                                                            Title = string.Empty,
                                                                            Address = string.Empty,
                                                                            City = string.Empty,
                                                                            State = string.Empty,
                                                                            Latitude = string.Empty,
                                                                            Longitude = string.Empty
                                                                        }
                                                                }
                                               }
                           };
            var data = JsonConvert.DeserializeAnonymousType(result, anon);
            var stops = new List<Stop>();
            if (data.ResultSet.Result != null)
            {
                foreach (var a in data.ResultSet.Result)
                {
                    var stop = new Stop
                    {
                        lat = double.Parse(a.Latitude),
                        lng = double.Parse(a.Longitude),
                        address = new Address
                                      {
                                          city = a.City,
                                          street = a.Address,
                                          prov = a.State
                                      },
                        name = a.Title
                    };
                    stops.Add(stop);
                }
            }
            return stops.ToArray();
        }

        private Stop[] GetCanadaBusinessTypesAtLocation(string search, double lat, double lng)
        {
            WebClient client = new WebClient();
            var userid = HttpContext.Current.Request.UserHostAddress;
            var address = string.Format("http://api.yellowapi.com/FindBusiness/?pg=1&what={0}&lang=en&where=cZ{1},{2}&pgLen=5&fmt=JSON&UID={3}&apikey=jpa5r23f78vun3btzjvvwmk5", search, lng, lat, userid);
            var result = client.DownloadString(address);
            var anon = new
            {
                listings = new[]
                                              {
                                                  new
                                                      {
                                                          id = string.Empty,
                                                          name = string.Empty,
                                                          address = new 
                                                                        {
                                                                            street = string.Empty,
                                                                            city = string.Empty,
                                                                            prov = string.Empty,
                                                                            pcode = string.Empty
                                                                        },
                                                      geoCode = new {
                                                        latitude= string.Empty,
                                                        longitude= string.Empty
                                                      }
                                                      }
                                              }
            };
            var data = JsonConvert.DeserializeAnonymousType(result, anon);
            var stops = new List<Stop>();
            if (data.listings != null)
            {
                foreach (var a in data.listings)
                {
                    var stop = new Stop
                    {
                        lat = double.Parse(a.geoCode.latitude),
                        lng = double.Parse(a.geoCode.longitude),
                        address = new Address
                        {
                            city = a.address.city,
                            prov = a.address.prov,
                            street = a.address.street
                        },
                        name = a.name
                    };
                    stops.Add(stop);
                }
            }
            return stops.ToArray();
        }
    }

    public class Stop
    {
        public double lat { get; set; }
        public double lng { get; set; }
        public Address address { get; set; }
        public string name { get; set; }
    }

    public class Address
    {
        public string street { get; set; }
        public string city { get; set; }
        public string prov { get; set; }
    }
}
