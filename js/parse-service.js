Parse.initialize("zUNltvbSGI2Jh1j8hJwD9acWtdbxAA5XzmmS95w7", "Tp83XbAPCCFHnse06AwJ7hBekJXagRGNYVmuBJPz");

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
      query.equalTo("objectId", pageId);
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

    this.savePage = function (pageId, pageData, plug, rePublish, successCallback, failureCallback) {      
      var PageItem = Parse.Object.extend("PageItem");
      var query = new Parse.Query(PageItem);
      query.get(pageId, {
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