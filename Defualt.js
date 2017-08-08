function Setslider() {
   

var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('carousel')/items?$select=id,Title,Description,Attachments,AttachmentFiles&$expand=AttachmentFiles";

            var requestHeaders = {
                "accept": "application/json;odata=verbose",
            }

            return $.ajax({
                type: 'GET',
                async: false,
                url: requestUri,
                headers: requestHeaders,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (data) {
                    $.each(data.d.results, function (index, result) {
                        console.log(result);
var Desc="";
if(result.Description!=null )
{
Desc=result.Description
}
                        $(".carousel-indicators").append("<li data-target='#myCarousel' data-slide-to='" + index + "'></li>");
if(index==0){
                        $(".carousel-inner").append('<div class="item active"><div class="fill" style="background-image:url(' + _spPageContextInfo.siteAbsoluteUrl + result.AttachmentFiles.results[0].ServerRelativeUrl + ');"></div><div class="carousel-caption">' + Desc + '<h2></h2></div></div>');
}
else
{
$(".carousel-inner").append('<div class="item"><div class="fill" style="background-image:url(' + _spPageContextInfo.siteAbsoluteUrl + result.AttachmentFiles.results[0].ServerRelativeUrl + ');"></div><div class="carousel-caption">' + Desc + '<h2></h2></div></div>');
}
                    });
$(".carousel-inner").css("height","320px");
$('.carousel').carousel({
            interval: 5000 //changes the speed
        });
                },
                error: function (error) {
                    alert(JSON.stringify(error));
                }
            });


}
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', Setslider);



