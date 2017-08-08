function GetAllMeetings() {
    $.when(CheckAdmin()).done(function (data) {
        if (data.d.results.length > 0) {
            $("#NewMeeting").show();
        }
        else {
            $("#NewMeeting").hide();
        }
    });

    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Meetings')/items?$select=From,TO,id,Created,ExternalContacts/FirstName,Attendance/Title,Title&$expand=Attendance/Id,ExternalContacts/Id",
        type: "Get",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            debugger;
            var table = $('#dataTables-example').DataTable({
                dom: 'Bfrtip',
                buttons: [
                    'excel', 'pdf', 'print'
                ],
                responsive: true,
                "order": [[3, "desc"]]
            });
            $.each(data.d.results, function (i, result) {
                moment.locale('en');
                var From = new Date(result.From);
                //From=moment(new Date(new Date(From.getTime() + From.getTimezoneOffset()*60000)).toString()).format('LLLL')
                From = From.toLocaleDateString() + " " + From.toLocaleTimeString();
                var To = new Date(result.TO);
                To = To.toLocaleDateString() + " " + To.toLocaleTimeString();
                var MeetingTitle = "";
                var AttendanceTitle = "";
                var ProjectTitle = "";

                if (result.Attendance != null && result.Attendance.results != null && result.Attendance.results.length > 0) {
                    $.each(result.Attendance.results, function (index, value) {
                        AttendanceTitle = AttendanceTitle + value.Title + "&nbsp;& &nbsp;";
                    });
                    AttendanceTitle.replace('&', '');
                }

                if (result.Attendance.Title != null) {
                    AttendanceTitle = result.Attendance.Title;
                }
                
                if (result.ExternalContacts != null && result.ExternalContacts.results != null && result.ExternalContacts.results.length > 0) {
                    $.each(result.ExternalContacts.results, function (index, value) {
                        AttendanceTitle = AttendanceTitle + value.FirstName + "&nbsp;& &nbsp;";
                    });
                    AttendanceTitle.replace('&', '');
                }

                if (result.Attendance.FirstName != null) {
                    AttendanceTitle = result.ExternalContacts.FirstName;
                }
                
                
                table.row.add([
                    "<a href='MeetingDetials.aspx?MeetingID=" + result.ID + "'><i class='fa fa-eye' aria-hidden='true'></i></a>",
                    result.Title,
                    From, To,
                    '<a onclick="GetSubMeetings(' + result.ID + ')"><i class="fa fa-plus-square" aria-hidden="true"></i>Sub Meeting</a><div id="submeetings_' + result.ID + '"> <ul></ul> </div>',
                    AttendanceTitle
                ]).draw(false);
            });
            $(".dt-buttons").css("float", "right");
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function RedirectDocumentFilter(meetingname) {
    var URL = _spPageContextInfo.webAbsoluteUrl + "/Documents/Forms/AllItems.aspx?FilterField1=Meeting&FilterValue1=" + meetingname;

    SP.UI.ModalDialog.showModalDialog({
        url: URL,
        title: "View Documents",
        allowMaximize: true,
        showClose: true,
        width: 850,
        height: 800,
        // dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
}

function RedirectActionsFilter(meetingname) {
    var URL = _spPageContextInfo.webAbsoluteUrl + "/Lists/Actions/AllItems.aspx?FilterField1=Meeting&FilterValue1=" + meetingname;
    debugger;

    SP.UI.ModalDialog.showModalDialog({
        url: URL,
        title: "View Actions",
        allowMaximize: true,
        showClose: true,
        width: 850,
        height: 800,
        //  dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
}

function AddNewMeeting() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Meetings/NewForm.aspx",
        title: "Add New Meeting",
        allowMaximize: true,
        showClose: true,
        showMaximized: true,
        width: 850,
        height: 600,
        dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
    $('#dlgTitleBtns').css("padding", "15px");
}

function GetSubMeetings(ID) {


    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('SubMeetings')/items?$select=ID,Created,Attendance/Title,Title,MainMeeting/Id&$expand=Attendance/Id,MainMeeting/Id&$filter=MainMeeting/Id%20eq%20" + ID+"&$orderby=From",
        type: "Get",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            debugger;
            $("#submeetings_" + ID + " ul").empty();
            $.each(data.d.results, function (i, result) {

                var date = new Date(result.Created);
                date = (date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear());
                var MeetingTitle = "";
                var AttendanceTitle = "";
                $("#submeetings_" + ID + " ul").append('<li><a href="MeetingDetials.aspx?sub=1&MeetingID=' + result.ID + '"> <span class="tab">' + result.Title + "  " + date + '</span></a></li>');
                //  $("#submeetings_"+ID+" ul").append('<li><a href="#"><span class="tab">' + result.Title + "  " + date + '</span></a></li>');
            });
        },
        error: function (data) {
            console.log(data);
        }
    });
}


SP.SOD.executeFunc('sp.js', 'SP.ClientContext', GetAllMeetings);