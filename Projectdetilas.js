function AddNewMeeting() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Meetings/NewForm.aspx",
        title: "Add New Meeting",
        allowMaximize: true,
        showClose: true,
        width: 850,
        height: 600,
        dialogReturnValueCallback: newCallback
    });
    function newCallback(dialogResult, returnValue) {
        SP.UI.ModalDialog.RefreshPage(SP.UI.DialogResult.OK);
    }
}

function EditProject() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    var ID = GetUrlKeyValue("projectID", false, location.href);
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Projects/EditForm.aspx?ID=" + ID,
        title: "Edit Project Information",
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


function GetProjectDetails() {

    $.when(CheckAdmin()).done(function (data) {
        if (data.d.results.length > 0) {
            $("#EditProject").show();
            $("#RelatedDocuemntURL").show();


        }
        else {
            $("#EditProject").hide();
            $("#RelatedDocuemntURL").hide();

        }
    });


    var table = $('#dataTables-example').DataTable({
        responsive: true,
        bLengthChange: false,

        pagingType: "simple",
        pageLength: 3,
        "dom": '<"pull-left"f><"pull-right"l>tip'
    });
    var table3 = $('#dataTables-example3').DataTable({
        responsive: true,
        bLengthChange: false,

        pagingType: "simple",
        pageLength: 3,
        "dom": '<"pull-left"f><"pull-right"l>tip'
    });
    var ID = GetUrlKeyValue("projectID", false, location.href);

    if (ID != "") {
        jQuery.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Projects')/items?$filter=Id eq " + ID + "&$select=Title,ProjectDirector,ProjectDescription,Created",
            type: "Get",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                debugger;

                $.each(data.d.results, function (i, result) {
                    $("#RelatedDocuemntURL").on("click", function () {
                        RedirectDocumentFilter(result.Title);
                    });
                    $("#ProjectNamecrumbs").html("<a href='#'>" + result.Title + "</a>");
                    $("#ProjectNameMain").text(result.Title);
                    $("#TimeLineLink").attr("href", "ActionsTime.aspx?projectID=" + ID);
                    var date = new Date(result.Created);
                    date = (date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear());
                    $("#Created").html(result.ProjectDescription);
                    $("#ProjectTeam").text(result.ProjectDirector);

                });
                //ge related main meeting 
                jQuery.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Meetings')/items?$select=ID,MeetingDescription,Project/Id,Created,Title&$expand=Project/Id&$filter=Project/Id eq " + ID,
                    type: "Get",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        debugger;
                        $("#RelatedMeetingscount").text(data.d.results.length);


                        $.each(data.d.results, function (i, result) {
                            var date = new Date(result.Created);
                            date = (date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear());

                            table.row.add([
                                "<div class='media'> <a href='MeetingDetials.aspx?MeetingID=" + result.ID + "'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa-users fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><span style='float:right;margin-top:0 px'> " + date + "</span><a href='MeetingDetials.aspx?MeetingID=" + result.ID + "'> <h4 class='media-heading'>" + result.Title + "</h4></a><p>" + result.MeetingDescription + "</p></div></div>"
                            ]).draw(false);


                            jQuery.ajax({

                                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Documents')/items?$select=ID,Meeting/Title,Editor/Title,Author/Title,Project/Title,FieldValuesAsText,FieldValuesAsText/FileRef&$expand=Meeting/Id,Author/Id,FieldValuesAsText,Project/Id,Editor/Id&$filter=Meeting/Id eq " + result.ID,
                                type: "Get",
                                headers: {
                                    "accept": "application/json;odata=verbose",
                                    "content-type": "application/json;odata=verbose",
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                                },
                                success: function (data) {
                                    debugger;

                                    //  $("#RelatedDocumentCount").text(data.d.results.length);

                                    // $("#RelatedDocumentCount").text(data.d.results.length + parseInt($("#RelatedDocumentCount").text()));

                                    $.each(data.d.results, function (i, result) {
                                        var Author = "";
                                        var Editor = "";
                                        var DocUrl = window.location.protocol + "//" + window.location.host;
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
                                        console.log(VersionLink);
                                        table3.row.add([
                                            "<div class='media'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa fa-file fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><div><p><a target='_blank' href='" + DocUrl + "?web=1'> <strong>" + DocName + "</strong></a><br /><strong class='text-left'>From :</strong> " + AutherName + "<strong class='text-right'>Modify by :</strong> " + Editor + "</p><div class='pull-right'><a  href='#' class='EditButton' onclick='EditDoc(" + result.ID + ")'> <i class='fa fa-pencil' aria-hidden='true'></i> </a>" + VersionLink + "<i class='fa fa-code-fork' aria-hidden='true'></i> </a><a href='" + DocUrl + "?web=0'> <i class='fa fa-download' aria-hidden='true'></i> </a></div></div></div></div>"
                                        ]).draw(false);
                                    });
                                },
                                error: function (data) {
                                    console.log(data);
                                }
                            });
                        });
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });

                //end of get realted main meeting 



                //ge related sub main meeting 
                jQuery.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('SubMeetings')/items?$select=ID,MeetingDescription,Project/Id,Created,Title&$expand=Project/Id&$filter=Project/Id eq " + ID,
                    type: "Get",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        debugger;
                        $("#RelatedMeetingscount").text(data.d.results.length);


                        $.each(data.d.results, function (i, result) {
                            var date = new Date(result.Created);
                            date = (date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear());

                            table.row.add([
                                "<div class='media'> <a href='MeetingDetials.aspx?sub=1&MeetingID=" + result.ID + "'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa-users fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><span style='float:right;margin-top:0 px'> " + date + "</span><a href='MeetingDetials.aspx?sub=1&MeetingID=" + result.ID + "'> <h4 class='media-heading'>" + result.Title + "</h4></a><p>" + result.MeetingDescription + "</p></div></div>"
                            ]).draw(false);

                            jQuery.ajax({

                                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Documents')/items?$select=ID,SubMeetings/Title,Editor/Title,Author/Title,Project/Title,FieldValuesAsText,FieldValuesAsText/FileRef&$expand=SubMeetings/Id,Author/Id,FieldValuesAsText,Project/Id,Editor/Id&$filter=SubMeetings/Id eq " + result.ID,
                                type: "Get",
                                headers: {
                                    "accept": "application/json;odata=verbose",
                                    "content-type": "application/json;odata=verbose",
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                                },
                                success: function (data) {
                                    debugger;

                                    //  $("#RelatedDocumentCount").text(data.d.results.length);

                                    // $("#RelatedDocumentCount").text(data.d.results.length + parseInt($("#RelatedDocumentCount").text()));

                                    $.each(data.d.results, function (i, result) {
                                        var Author = "";
                                        var Editor = "";
                                        var DocUrl = window.location.protocol + "//" + window.location.host;
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
                                        console.log(VersionLink);
                                        table3.row.add([
                                            "<div class='media'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa fa-file fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><div><p><a target='_blank' href='" + DocUrl + "?web=1'> <strong>" + DocName + "</strong></a><br /><strong class='text-left'>From :</strong> " + AutherName + "<strong class='text-right'>Modify by :</strong> " + Editor + "</p><div class='pull-right'><a  href='#' class='EditButton' onclick='EditDoc(" + result.ID + ")'> <i class='fa fa-pencil' aria-hidden='true'></i> </a>" + VersionLink + "<i class='fa fa-code-fork' aria-hidden='true'></i> </a><a href='" + DocUrl + "?web=0'> <i class='fa fa-download' aria-hidden='true'></i> </a></div></div></div></div>"
                                        ]).draw(false);


                                    });
                                },
                                error: function (data) {
                                    console.log(data);
                                }
                            });
                        });
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });

                //end of get realted sub meeting 

                jQuery.ajax({

                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Documents')/items?$select=ID,Meeting/Title,Editor/Title,Author/Title,Project/Title,FieldValuesAsText,FieldValuesAsText/FileRef&$expand=Meeting/Id,Author/Id,FieldValuesAsText,Project/Id,Editor/Id&$filter=Project/Id eq " + ID,
                    type: "Get",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        debugger;
                        console.log("From Second Meeting" + data.d.results.length);
                        //   $("#RelatedDocumentCount").text(data.d.results.length);

                        $.each(data.d.results, function (i, result) {
                            var Author = "";
                            var Editor = "";
                            var DocUrl = window.location.protocol + "//" + window.location.host;
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
                            console.log(VersionLink);
                            table3.row.add([
                                "<div class='media'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa fa-file fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><div><p><a  target='_blank' href='" + DocUrl + "?web=1'> <strong>" + DocName + "</strong></a><br /><strong class='text-left'>From :</strong> " + AutherName + "<strong class='text-right'>Modify by :</strong> " + Editor + "</p><div class='pull-right'><a href='#' class='EditButton' onclick='EditDoc(" + result.ID + ")'> <i class='fa fa-pencil' aria-hidden='true'></i> </a>" + VersionLink + "<i class='fa fa-code-fork' aria-hidden='true'></i> </a><a href='" + DocUrl + "?web=0'> <i class='fa fa-download' aria-hidden='true'></i> </a></div></div></div></div>"
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

                jQuery.ajax({

                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Actions')/items?$select=ID,Project/Title,Project/Id,Title,PercentComplete,Author/Title,AssignedTo/Title,Author/Id&$expand=Project/Id,AssignedTo/Id,Author/Id&$filter=Project/Id eq " + ID,
                    type: "Get",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        debugger;
                        // $("#RelatedActionsCount").text(data.d.results.length);

                        var table = $('#dataTables-example2').DataTable({
                            responsive: true,
                            bLengthChange: false,

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
                                "<div class='media'><a href='#' href='Meetingdetilas.html'>" + Reminder + "<div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa fa-tasks fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><div><p><a href='#' onclick='ActionDetilspop(" + result.ID + ")'> <strong>" + result.Title + "</strong></a><br /><strong class='text-left'>From :</strong> " + result.Author.Title + "<strong class='text-right'>TO :</strong> " + result.AssignedTo.results[0].Title + "</p><div class='progress progress-striped active'><div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width: " + PercentComplete + "%'><span>" + PercentComplete + "% Complete</span></div></div></div></div></div>"
                            ]).draw(false);
                        });

                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            },
            error: function (data) {
                console.log(data);
            }
        });
    }
    else {
        window.location = _spPageContextInfo.siteAbsoluteUrl + "/Pages/Projects.aspx"
    }
}
function ActionDetilspop(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Pages/EditAction.aspx?ID=" + id,
        title: "Edit/View Action",
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
function EditDoc(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Documents/Forms/EditForm.aspx?ID=" + id,
        title: "Edit Document Properties",
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


function GetDocVersion(guid, id, FileName) {
    debugger;
    var URL = _spPageContextInfo.webAbsoluteUrl;
    console.log(URL + "/_layouts/Versions.aspx?list=" + guid.replace(/"/g, "") + "&ID=" + id + "&IsDlg=1&FileName=" + URL + "/documents/" + FileName);
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/_layouts/Versions.aspx?list=" + guid.replace(/"/g, "") + "&ID=" + id + "&IsDlg=1&FileName=" + URL + "/documents/" + FileName,
        title: "Document History",
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

function RedirectDocumentFilter(meetingname) {
    var URL = _spPageContextInfo.webAbsoluteUrl + "/Documents/Forms/AllItems.aspx?FilterField1=Project&FilterValue1=" + meetingname;

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

SP.SOD.executeFunc('sp.js', 'SP.ClientContext', GetProjectDetails);