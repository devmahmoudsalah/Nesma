function GetMeetingDetails() {

    var table3 = $('#dataTables-example3').DataTable({
        responsive: true,
        bLengthChange: false,
        responsive: true,
        pagingType: "simple",
        pageLength: 3,
        "dom": '<"pull-left"f><"pull-right"l>tip'
    });

    $.when(CheckAdmin()).done(function (data) {
        if (data.d.results.length > 0) {
            $("#ExportMeetingAgenda").show();
            $("#SubMeetings").show();
            $("#RelatedDocuemntURL").show();
            $("#RelatedActions").show();
            $("#EditMeeting").show();
        }
        else {
            $("#ExportMeetingAgenda").hide();
            $("#SubMeetings").hide();
            $("#RelatedDocuemntURL").hide();
            $("#RelatedActions").hide();
            $("#EditMeeting").hide();
        }
    });

    var ID = GetUrlKeyValue("MeetingID", false, location.href);
    var sub = GetUrlKeyValue("sub", false, location.href);

    if (sub != null && sub == 1) {
        $("#meetingAgenda").hide()
    }
    GetMeetingAgenda('')




    var listName = "Meetings"
    var RequestUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/items?$select=Venue,From,TO,MeetingDescription,ID,Created,ExternalContacts/FirstName,Attendance/Title,Title,Departments/Id,Departments/Title,Project/Title,Project/Id&$expand=ExternalContacts/Id,Departments/Id,Project/Id,Attendance/Id&$filter=ID eq "
    if (sub == "1") {
        listName = "subMeetings";
        RequestUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/items?$select=Venue,MainMeeting/Id,MainMeeting/Title,From,TO,MeetingDescription,ID,Created,ExternalContacts/FirstName,Attendance/Title,Title,Departments/Id,Departments/Title,Project/Title,Project/Id&$expand=MainMeeting/Id,Departments/Id,Project/Id,Attendance/Id,ExternalContacts/Id&$filter=ID eq ";
        $("#SubMeetings").hide();
    }
    if (ID != "") {
        jQuery.ajax({

            url: RequestUrl + ID,
            type: "Get",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {



                $.each(data.d.results, function (i, result) {


                    if (data.d.results[0].Project != null && data.d.results[0].Project.results.length > 0) {
                        $.each(data.d.results[0].Project.results, function (i, result) {
                            $("#ProjectList").append('<a href="#" onclick="PopProject(' + result.Id + ')"><span class="label label-default" >' + result.Title + '</span> </a>&nbsp; &nbsp;');
                        });
                        $("#Projects").show();
                    }

                    if (data.d.results[0].Departments != null && data.d.results[0].Departments.results.length > 0) {
                        $.each(data.d.results[0].Departments.results, function (i, result) {
                            $("#DepartmentsList").append('<a href="#" onclick="PopDepartment(' + result.Id + ')"><span class="label label-default" >' + result.Title + '</span> </a>&nbsp; &nbsp;');
                        });
                        $("#Departments").show();
                    }


                    var meetingname = result.Title;
                    $("#MeetingName").text(meetingname);


                    // $("#tdSub-meetings").append("<strong>Sub-meetings (under</strong>  <span>" + result.Title + " </span>):");
                    $("#ProjectName").text(result.Project.ProjectName);
                    $("#RelatedDocuemntURL").on("click", function () {
                        RedirectDocumentFilter(result.Title);
                    });
                    if (result.MainMeeting != null && result.MainMeeting.Id != null) {
                        $("#MainMeetingTitle").html('<a onclick="MainMeetingpop(' + result.MainMeeting.Id + ')"><span class="label label-default"  style="font-size: small;" >' + result.MainMeeting.Title + '</span> </a>');
                        $("#NavMainMeetingTitle").html('<a href="/Pages/MeetingDetials.aspx?MeetingID=' + result.MainMeeting.Id + '">' + result.MainMeeting.Title + '</a>');
                    }
                    else {
                        $("#MainMeeting").hide();
                        $("#NavMainMeetingTitle").hide();
                    }
                    $("#MeetingTitle").text(result.Title);
                    $("#MeetingDescription").html(result.MeetingDescription);

                    var From = new Date(result.From);
                    From = From.toLocaleDateString() + " " + From.toLocaleTimeString();
                    var To = new Date(result.TO);
                    To = To.toLocaleDateString() + " " + To.toLocaleTimeString();
                    $("#From").text(From);
                    $("#To").text(To);
                    var meetingAgendaHear = '<div class="text-center"><img src="/Style%20Library/CustomJs/Logo.png" alt="nesma logo" /><h2>' + meetingname + '</h2><h4>' + (new Date(result.From)).toUTCString() + ' and ' + (new Date(result.TO)).toUTCString() + '</h4><h4>Venue: ' + result.Venue + '</h4></div><br>'
                    //var meetingAgendaHear = '<div class="text-center"><img src="logo.jpg" alt="nesma logo" /><h2>' + meetingname + '</h2></div><div class="row">' +  + ' To ' +  + '</div><div class="row"> Venue:' + result.Venue //+ '</div>';
                    $("#meetingheader").append(meetingAgendaHear);

                    if (result.Attendance != null && result.Attendance.results != null && result.Attendance.results.length > 0) {
                        $.each(result.Attendance.results, function (index, value) {
                            $("#ProjectTeam").append(value.Title + "&nbsp;& &nbsp;");
                        });
                    }
                    if (result.ExternalContacts != null && result.ExternalContacts.results != null && result.ExternalContacts.results.length > 0) {
                        $.each(result.ExternalContacts.results, function (index, value) {
                            $("#ProjectTeam").append(value.FirstName + "&nbsp;& &nbsp;");
                        });
                    }

                    // var meetingdetilas = "<p><strong> Main Meeting</strong>: <span>" + result.Title + "</span> </br> <strong>Meeting Date and Time</strong>:  <span>" + From + "</span>  <strong>To</strong>:  <span>" + To + "</span>  </br><strong>Venue (location):</strong> <strong>"
                    //  + result.Venue + "<br /> Attendees:</strong>: <span>" + $("#ProjectTeam").text() + "</span> </br><strong> Description</strong> <span>" + result.MeetingDescription + "</span></p>"
                    // $("#tdmeetingdetilas").append(meetingdetilas);



                });
                //end of meeting details
                jQuery.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('SubMeetings')/items?$select=Attendance/Id,Attendance/Title,From,TO,MeetingDescription,id,Created,Title,MainMeeting/Title&$expand=Attendance/Id,MainMeeting/Id&$filter=MainMeeting/Id eq " + ID + "&$orderby=From",
                    type: "Get",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        //  $("#RelatedMeetingscount").text(data.d.results.length);

                        var table = $('#dataTables-example').DataTable({
                            responsive: true,
                            bLengthChange: false,
                            responsive: true,
                            pagingType: "simple",
                            pageLength: 3,
                            "dom": '<"pull-left"f><"pull-right"l>tip',
                            "order": [[1, "asc"]],
                            "columnDefs": [
                                {
                                    "targets": [1],
                                    "visible": false
                                }
                            ]
                        });
                        console.log(data);
                        $.each(data.d.results, function (i, result) {

                            var From = new Date(result.From);
                            From = From.toLocaleDateString() + " " + From.toLocaleTimeString();

                            var To = new Date(result.TO);
                            To = To.toLocaleDateString() + " " + To.toLocaleTimeString();
                            var desc = "";
                            if (result.MeetingDescription != null) {
                                desc = result.MeetingDescription
                            }

                            var Attendance = "";
                            if (result.Attendance != null && result.Attendance.results != null && result.Attendance.results.length > 0) {
                                $.each(result.Attendance.results, function (index, value) {
                                    Attendance += value.Title + "&nbsp;& &nbsp;";
                                });
                            }


                            table.row.add([
                                "<div class='media'> <a href='MeetingDetials.aspx?sub=1&MeetingID=" + result.ID + "'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa-users fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><span style='float:right;margin-top:0 px'> " + From + "</span><a href='MeetingDetials.aspx?sub=1&MeetingID=" + result.ID + "'> <h4 class='media-heading'>" + result.Title + "</h4></a><p>" + desc + "</p></div></div>", From
                            ]).draw(false);

                            //$("#ulsubmeeting").append("<a target ='_blank' href='MeetingDetials.aspx?sub=1&MeetingID=" + result.ID + "'> " +
                            //  result.Title + "</a> <br/> <span ><strong> Meeting Date and Time: </strong>" + From + "</span> TO : <span >" + To + "</span> <br />  <span ><strong>Attendees: </strong>" +
                            // Attendance + "</span> <br />  <p><strong>Description:</strong>" + desc + "</p>");
                            //$("#ulsubmeeting").append("<hr>");
                            //get Related Document of SubMeetings

                            jQuery.ajax({

                                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Documents')/items?$select=ID,SubMeetings/Title,Editor/Title,Author/Title,Project/Title,FieldValuesAsText,FieldValuesAsText/FileRef&$expand=SubMeetings/Id,Author/Id,FieldValuesAsText,Project/Id,Editor/Id&$filter=SubMeetings/Id eq " + result.ID,
                                type: "Get",
                                headers: {
                                    "accept": "application/json;odata=verbose",
                                    "content-type": "application/json;odata=verbose",
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                                },
                                success: function (data) {

                                    //$("#RelatedDocumentCount").text(data.d.results.length);

                                    $.each(data.d.results, function (i, result) {
                                        var Author = "";
                                        var Editor = "";
                                        var DocUrl = window.location.protocol + "//" + window.location.host  ///sites/Nesma/Documents/Meeting Munites.docx  "https://mroushdy.sharepoint.com/sites/Nesma"
                                        var DocName = "";

                                        if (result.Author.Title != null) {
                                            AutherName = result.Author.Title;
                                        }

                                        if (result.Editor.Title != null) {
                                            Editor = result.Editor.Title;
                                        }

                                        if (result.FieldValuesAsText.FileRef != null) {
                                            DocName = result.FieldValuesAsText.FileRef.split('/')[result.FieldValuesAsText.FileRef.split('/').length - 1];
                                            DocUrl += result.FieldValuesAsText.FileRef;
                                        }

                                        var guid = "DB2F9469-19B7-41E2-8256-4D48FD067227";
                                        var VersionLink = "<a href='#' onclick=\"GetDocVersion('DB2F9469-19B7-41E2-8256-4D48FD067227'," + result.ID + "," + "'" + DocName + "')\">";






                                        table3.row.add([
                                            "<div class='media'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa fa-file fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><div><p><a href='" + DocUrl + "?web=1' target='_blank'> <strong>" + DocName + "</strong></a><br /><strong class='text-left'>From :</strong> " + AutherName + "<strong class='text-right'>Modify by :</strong> " + Editor + "</p><div class='pull-right'><a href='#' class='EditButton' onclick='EditDoc(" + result.ID + ")'> <i class='fa fa-pencil' aria-hidden='true'></i> </a>" + VersionLink + "<i class='fa fa-code-fork' aria-hidden='true'></i> </a><a href='" + DocUrl + "?web=0'> <i class='fa fa-download' aria-hidden='true'></i> </a></div></div></div></div>"
                                        ]).draw(false);
                                        $.when(CheckAdmin()).done(function (data) {
                                            if (data.d.results.length > 0) {
                                                $(".EditButton").show();
                                            }
                                            else {
                                                $(".EditButton").hide();
                                            }
                                        });
                                    });
                                },
                                error: function (data) {
                                    console.log(data);
                                }
                            });

                            //end of Get Related  Document


                        });

                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
                //end of related meetings


                jQuery.ajax({

                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Actions')/items?$select=ID,Meeting/Title,Meeting/Id,Title,PercentComplete,Author/Title,AssignedTo/Title,Author/Id&$expand=Meeting/Id,AssignedTo/Id,Author/Id&$filter=Meeting/Id eq " + ID,
                    type: "Get",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {

                        // $("#RelatedActionsCount").text(data.d.results.length);

                        var table = $('#dataTables-example2').DataTable({
                            responsive: true,
                            bLengthChange: false,
                            responsive: true,
                            pagingType: "simple",
                            pageLength: 3,
                            "dom": '<"pull-left"f><"pull-right"l>tip'
                        });
                        $.each(data.d.results, function (i, result) {
                            var date = new Date(result.Created);
                            date = (date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear());
                            var PercentComplete = result.PercentComplete * 100;
                            var Reminder = "";
                            if (PercentComplete < 100) {
                                Reminder = "<div class='pull-right'><a href='#'><i class='fa fa-bell' aria-hidden='true'></i></a></div>";
                            }

                            table.row.add([
                                "<div class='media'><a href='#'>" + Reminder + "<div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa fa-tasks fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><div><p><a href='#' onclick='ActionDetilspop(" + result.ID + ")'> <strong>" + result.Title + "</strong></a><br /><strong class='text-left'>From :</strong> " + result.Author.Title + "<strong class='text-right'>TO :</strong> " + (result.AssignedTo.results != undefined ? result.AssignedTo.results[0].Title : "") + "</p><div class='progress progress-striped active'><div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width: " + PercentComplete + "%'><span>" + PercentComplete + "% Complete</span></div></div></div></div></div>"
                            ]).draw(false);
                        });
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });

                //end of realted action


                var URL = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Documents')/items?$select=ID,Meeting/Title,Editor/Title,Author/Title,Project/Title,FieldValuesAsText,FieldValuesAsText/FileRef&$expand=Meeting/Id,Author/Id,FieldValuesAsText,Project/Id,Editor/Id&$filter=Meeting/Id eq " + ID;
                if (GetUrlKeyValue('sub') == "1")
                    URL = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Documents')/items?$select=ID,SubMeetings/Title,Editor/Title,Author/Title,Project/Title,FieldValuesAsText,FieldValuesAsText/FileRef&$expand=SubMeetings/Id,Author/Id,FieldValuesAsText,Project/Id,Editor/Id&$filter=SubMeetings/Id eq " + ID;
                jQuery.ajax({

                    url: URL,
                    type: "Get",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {

                        // $("#RelatedDocumentCount").text(data.d.results.length + parseInt( $("#RelatedDocumentCount").text));


                        $.each(data.d.results, function (i, result) {
                            var Author = "";
                            var Editor = "";
                            var DocUrl = window.location.protocol + "//" + window.location.host  ///sites/Nesma/Documents/Meeting Munites.docx  "https://mroushdy.sharepoint.com/sites/Nesma"
                            var DocName = "";

                            if (result.Author.Title != null) {
                                AutherName = result.Author.Title;
                            }

                            if (result.Editor.Title != null) {
                                Editor = result.Editor.Title;
                            }

                            if (result.FieldValuesAsText.FileRef != null) {
                                DocName = result.FieldValuesAsText.FileRef.split('/')[result.FieldValuesAsText.FileRef.split('/').length - 1];
                                DocUrl += result.FieldValuesAsText.FileRef;
                            }

                            var guid = "DB2F9469-19B7-41E2-8256-4D48FD067227";
                            var VersionLink = "<a href='#' onclick=\"GetDocVersion('DB2F9469-19B7-41E2-8256-4D48FD067227'," + result.ID + "," + "'" + DocName + "')\">";

                            table3.row.add([
                                "<div class='media'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa fa-file fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><div><p><a href='" + DocUrl + "?web=1' target='_blank'> <strong>" + DocName + "</strong></a><br /><strong class='text-left'>From :</strong> " + AutherName + "<strong class='text-right'>Modify by :</strong> " + Editor + "</p><div class='pull-right'><a href='#' class='EditButton' onclick='EditDoc(" + result.ID + ")'> <i class='fa fa-pencil' aria-hidden='true'></i> </a>" + VersionLink + "<i class='fa fa-code-fork' aria-hidden='true'></i> </a><a href='" + DocUrl + "?web=0'> <i class='fa fa-download' aria-hidden='true'></i> </a></div></div></div></div>"
                            ]).draw(false);


                            $.when(CheckAdmin()).done(function (data) {
                                if (data.d.results.length > 0) {
                                    $(".EditButton").show();
                                }
                                else {
                                    $(".EditButton").hide();
                                }
                            });

                        });
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });

                //end of rrelated document
            },
            error: function (data) {
                console.log(data);
            }
        });
    }
    else {
        window.location = _spPageContextInfo.siteAbsoluteUrl + "/Pages/Meetings.aspx"
    }
}

function EditDoc(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Documents/Forms/EditForm.aspx?ID=" + id,
        title: "Edit File Properties",
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

function GetDocVersion(guid, id, FileName) {

    var URL = _spPageContextInfo.webAbsoluteUrl;

    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/_layouts/Versions.aspx?list=" + guid.replace(/"/g, "") + "&ID=" + id + "&IsDlg=1&FileName=" + URL + "/documents/" + FileName,
        title: "Document History",
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

function ActionDetilspop(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Pages/EditAction.aspx?ID=" + id,
        title: "Edit/View Action",
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
function RedirectDocumentFilter(meetingname) {

    var URL = _spPageContextInfo.webAbsoluteUrl + "/Documents/Forms/AllItems.aspx?FilterField1=Meeting&FilterValue1=" + meetingname;
    if (GetUrlKeyValue('sub') == "1")
        var URL = _spPageContextInfo.webAbsoluteUrl + "/Documents/Forms/AllItems.aspx?FilterField1=SubMeetings&FilterValue1=" + meetingname;

    SP.UI.ModalDialog.showModalDialog({
        url: URL,
        title: "Upload Files",
        allowMaximize: true,
        showClose: true,
        showMaximized: true,
        width: 850,
        height: 800,
        dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
    $('#dlgTitleBtns').css("padding", "15px");
}

function AddNewMeeting() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    var itemId = GetUrlKeyValue('MeetingID');
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/SubMeetings/NewForm.aspx?MeetingID=" + itemId,
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

function AddNewAction() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    var itemId = GetUrlKeyValue('MeetingID');
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Actions/NewForm.aspx?MeetingID=" + itemId,
        title: "Add New Action",
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

function PopProject(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;

    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Pages/Projectdetilas.aspx?projectID=" + id,
        title: "Display Related Project Detials",
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
    $('#dlgTitleBtns').css("padding", "15px");
}

function MainMeetingpop(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;

    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Pages/MeetingDetials.aspx?MeetingID=" + id,
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
    $('#dlgTitleBtns').css("padding", "15px");
}

function PopDepartment(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;

    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Pages/Departmentdetilas.aspx?DepID=" + id,
        title: "Display Related  Department Detials",
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
    $('#dlgTitleBtns').css("padding", "15px");
}
function Export() {
    $("#page-content").wordExport();
}

function EditMeeting() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    var ID = GetUrlKeyValue("MeetingID", false, location.href);
    var EditUrl = "/Lists/Meetings/EditForm.aspx?ID=";
    var usbID = GetUrlKeyValue("sub", false, location.href);
    if (usbID != "") {
        var EditUrl = "/Lists/SubMeetings/EditForm.aspx?ID=";
    }
    SP.UI.ModalDialog.showModalDialog({
        url: URL + EditUrl + ID,
        title: "Edit Meeting Information",
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
    $('#dlgTitleBtns').css("padding", "15px");
}

function GetMeetingAgenda(type) {

    var selector = "#meetingAgenda"
    if (type == "Export") selector = "#ExportmeetingAgenda"
    var ID = GetUrlKeyValue("MeetingID", false, location.href);
    jQuery.ajax({

        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('MeetingAgenda')/Items?$select=EndDate,Title,MainMeeting/Title,MainMeeting/Title,SubMeeting/Id,SubMeeting/Title,FullName,StartDate&$orderby=StartDate&$expand=MainMeeting/Title,%20SubMeeting/Title&$filter=MainMeeting/Id eq "
        + ID,
        type: "Get",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            console.log(data);
            var DatesArray = [];
            $.each(data.d.results, function (i, result) {
                if (DatesArray.indexOf(new Date(result.StartDate).toLocaleDateString()) == -1) {
                    DatesArray.push(new Date(result.StartDate).toLocaleDateString());
                }
            });
            var DateOrderByDate = [];
            $(selector).find("tr:gt(0)").remove()
            $.each(DatesArray, function (i, result1) {
                var DataAfterformate = new Date(result1).toUTCString().substring(0, new Date(result1).toUTCString().indexOf('G') - 9)
                $(selector + ' tr:last').after('<tr><td colspan="4" class="day-title"><strong>DAY ' + parseInt(i + 1) + " -" + DataAfterformate + '</strong></td></tr>');
                $(selector + ' tr:last').after('<tr><th>S#</th><th>TOPIC</th><th>PRESENTED BY</th><th>Time</th></tr>');
                $.each(data.d.results, function (i, result2) {
                    if (result1 == new Date(result2.StartDate).toLocaleDateString()) {
                        if (result2.Title == null && result2.FullName == null) {
                            $(selector + ' tr:last').after('<tr><td colspan="3" class="text-center"> Lunch Break </td><td>' + new Date(result2.StartDate).toLocaleTimeString() + '-' + new Date(result2.EndDate).toLocaleTimeString() + '</td></tr>');
                        }
                        else if (result2.Title == null) {
                            $(selector + ' tr:last').after('<tr><td>' + parseInt(i + 1) + '</td><td><a target=_blank href="MeetingDetials.aspx?sub=1&MeetingID=' + result2.SubMeeting.Id + '">' + result2.SubMeeting.Title + '</a></td><td>' + result2.FullName + '</td><td>' + new Date(result2.StartDate).toLocaleTimeString() + '-' + new Date(result2.EndDate).toLocaleTimeString() + '</td></tr>');
                        }
                        else {
                            $(selector + ' tr:last').after('<tr><td>' + parseInt(i + 1) + '</td><td>' + result2.Title + '</td><td>' + result2.FullName + '</td><td>' + new Date(result2.StartDate).toLocaleTimeString() + '-' + new Date(result2.EndDate).toLocaleTimeString() + '</td></tr>');
                        }
                    }
                });
            });
        },
        error: function (data) {
            console.log(data);
        }
    });

}



SP.SOD.executeFunc('sp.js', 'SP.ClientContext', GetMeetingDetails);