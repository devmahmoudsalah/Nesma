 String.prototype.fromEdmDate = function() {
return new Date(parseInt(this.match(/\/Date\(([0-9]+)(?:.*)\)\//)[1]));
};

function AddNewEvent() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Events/NewForm.aspx",
        title: "Add New Event",
        allowMaximize: true,
showMaximized: true,
        showClose: true,
        width: 850,
        height: 600,
        dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
$('#dlgTitleBtns').css("padding","15px");
}
function GetAllEvents() {
$.when(CheckAdmin()).done(function (data) {
            if (data.d.results.length > 0) {
                $("#NewEvent").show();
            }
            else {
                $("#NewEvent").hide();
            }
        });
moment.locale("ar");
    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Events')/items?$select=ID,Title,EventDate,EndDate",
        type: "Get",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            debugger;
            var eventsArr = [];
            $.each(data.d.results, function (i, result) {
console.log(moment(new Date(result.EventDate).toString()).format('LLLL'));
                var events = new Object();
                events.id= result.ID;
                events.title = result.Title;
                events.start = moment(new Date(result.EventDate).toString()).format('LLLL');
                events.end = moment(new Date(result.EndDate).toString()).format('LLLL'); 
              events.className="event";
                eventsArr.push(events);
            });
///start get meetings
jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Meetings')/items?$select=From,TO,id,Title",
        type: "Get",
async:false,
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
           
            $.each(data.d.results, function (i, result) {

                var events = new Object();
                events.id= result.ID;
                events.title = result.Title;
                events.start = moment(new Date(result.From).toString()).format('LLLL');
                events.end = moment(new Date(result.TO).toString()).format('LLLL'); 
                events.className="meeting";
                eventsArr.push(events);
            });
        },
        error: function (data) {
            console.log(data);
        }
    });

//end get meetings
            console.log(eventsArr);
debugger;
            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                defaultDate: new Date,
                editable: false,
                eventLimit: true, // allow "more" link when too many events
                events: eventsArr,
timeFormat:'h:mm',
displayEventEnd :true,
eventClick: function(calEvent, jsEvent, view) {
 console.log(calEvent.className);
if(calEvent.className[0]=="meeting")
{
MainMeetingpop(calEvent.id);
}

else{
EventsDetilspop(calEvent.id);
}
   

 }
            });
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function EventsDetilspop(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Events/EditForm.aspx?ID=" + id,
        title: "Edit /View Events",
        allowMaximize: true,
showMaximized: true,
        showClose: true,
        width: 850,
        height: 600,
        dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
$('#dlgTitleBtns').css("padding","15px");
}

function MainMeetingpop(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;

    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Pages/MeetingDetials.aspx?MeetingID="+id,
        title: "Display Main Meeting Detials",
        allowMaximize: true,
        showClose: true,
showMaximized: true,
        width: 850,
        height: 600,
        dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        //SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
$('#dlgTitleBtns').css("padding","15px");
}

SP.SOD.executeFunc('sp.js', 'SP.ClientContext', GetAllEvents);