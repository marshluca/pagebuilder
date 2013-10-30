Parse.initialize("zUNltvbSGI2Jh1j8hJwD9acWtdbxAA5XzmmS95w7", "Tp83XbAPCCFHnse06AwJ7hBekJXagRGNYVmuBJPz");

var blankTemplateData = "[{\"id\":0,\"variation_name\":\"A\",\"page_blocks\":[{\"id\":\"page_block_header\",\"height\":\"83px\"},{\"id\":\"page_block_above_fold\",\"height\":\"586px\"},{\"id\":\"page_block_below_fold\",\"height\":\"422px\"},{\"id\":\"page_block_footer\",\"height\":\"55px\"}],\"elements\":[],\"background\":{\"color\":\"ffffff\",\"image\":null,\"position\":\"top left\",\"repeat\":\"repeat\",\"page\":{\"background_color\":\"transparent\"}},\"font\":\"Open Sans\",\"title\":\"Page title for search engines\",\"description\":\"Page description for search engines\",\"plug\":\"Free Landing Page\",\"name\":\"Demo4\",\"traffic\":[{\"date\":\"2013-10-23\",\"visits\":0,\"conversions\":0},{\"date\":\"2013-10-24\",\"visits\":0,\"conversions\":0},{\"date\":\"2013-10-25\",\"visits\":0,\"conversions\":0},{\"date\":\"2013-10-26\",\"visits\":0,\"conversions\":0},{\"date\":\"2013-10-27\",\"visits\":0,\"conversions\":0},{\"date\":\"2013-10-28\",\"visits\":0,\"conversions\":0},{\"date\":\"2013-10-29\",\"visits\":0,\"conversions\":0}]}]"

var ParseService = function () {

    this.getAllPages = function () {
        var Page = Parse.Object.extend("Page");
        var query = new Parse.Query(Page);
        query.find({
          success: function(results) {
            alert("Successfully retrieved " + results.length + " scores.");
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) { 
              var page = results[i];
              alert(page);              
            }
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
    };

    this.getPage = function (pageId, version, successCallback, failureCallback) {
      var PageItem = Parse.Object.extend("PageItem");
      var query = new Parse.Query(PageItem);
      query.equalTo("pageId", pageId);
      query.equalTo("version", version);
      query.first({
        success: function(pageItem) {
          // Successfully retrieved the object.                  
          var response = JSON.stringify(pageItem);          
          var pageData = JSON.stringify(JSON.parse(response).data);
          var data = {
              "error": false,
              "success": true,
              "message": "Page loaded.",
              "data": pageData
          }
          successCallback(data);
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
          failureCallback(error);
        }
      });
    };

    this.createPage = function (pageName) {
      // TODO: associate with user
      var Page = Parse.Object.extend("Page");
      var page = new Page();             
      page.save({        
        version: 1,              
        title: pageName,        
        shortTitle: pageName,
        status: "stopped",
        plug: "Free Landing Page"
      }, {
        success: function(page) {
          // The object was saved successfully.          
          console.log(page);
          // create a PageItem with blank template
          var PageItem = Parse.Object.extend("PageItem");
          var pageItem = new PageItem();             
          pageItem.save({
            version: 1,
            pageId: page.id,            
            plug: "Free Landing Pages",
            data: JSON.stringify(blankTemplateData)
          }, {
            success: function(pageItem) {
              // The object was saved successfully.
              window.location = "/builder/editor.html?id=" + page.id;
            },
            error: function(pageItem, error) {
              // The save failed.
              // error is a Parse.Error with an error code and description.
            }
          });          
        },
        error: function(object, error) {
          // The save failed.
          // error is a Parse.Error with an error code and description.
          alert('Failed to create new page, with error code: ' + error.description);          
        }
      });
    };

    this.savePage = function (pageId, pageData, plug, rePublish, successCallback, failureCallback) {      
      var PageItem = Parse.Object.extend("PageItem");
      var query = new Parse.Query(PageItem);
      query.equalTo("pageId", pageId);
      query.equalTo("version", 1); // TODO:
      query.first({
        success: function(pageItem) {
          // The object was retrieved successfully.
          // alert('New object created with objectId: ' + pageItem.id);                    
          pageItem.save({
            data: JSON.stringify(pageData),
            // plug: plug,
            // rePublish: rePublish,
            version: 1
          }, {
            success: function(pageItem) {
              // The object was saved successfully.                            
              var response = {"error":false,"success":true,"message":"Page saved.","data":{"version":pageItem.version}}
              successCallback(response);
            },
            error: function(pageItem, error) {
              // The save failed.
              // error is a Parse.Error with an error code and description.              
              failureCallback(error);
            }
          });
          
        },
        error: function(pageItem, error) {
          // The object was not retrieved successfully.
          // error is a Parse.Error with an error code and description.
          alert('Failed to create new object, with error code: ' + error.description);          
        }
      });
    }

}