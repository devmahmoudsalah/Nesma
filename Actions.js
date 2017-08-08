function GetActions() {
    $.when(CheckAdmin()).done(function (data) {
        if (data.d.results.length > 0) {
            $("#NewAction").show();
        }
        else {
            $("#NewAction").hide();
        }
    });
    console.log(_spPageContextInfo.webAbsoluteUrl);
    var ID = GetUrlKeyValue("projectID", false, location.href)
    jQuery.ajax({

        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Actions')/items?$select=ExternalContacts/FirstName,Body,ID,Created,DueDate,Meeting/Title,Project/Title,Project/Id,Title,PercentComplete,Author/Title,AssignedTo/Title,Author/Id&$expand=ExternalContacts/Id,Meeting/Id,Project/Id,AssignedTo/Id,Author/Id",
        type: "Get",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            debugger;
            $("#AllActionsCount").text(data.d.results.length);

            var table = $('#dataTables-example').DataTable({
                responsive: true,
                "order": [[6, "desc"]],
                "columnDefs": [
                    {
                        "targets": [0],
                        "visible": false
                    },
                    {
                        "targets": [1],
                        "visible": false
                    },
                    {
                        "targets": [10],
                        "visible": false
                    }
                ],
                dom: 'Bfrtip',
                buttons: [
                    'excel', 'pdf', 'print'
                ]

            });

            $("#Views").on("click", ".AllAction", function (event) {
                table.search('').columns().search('').draw();
            });
            $("#Views").on("click", ".NewAction", function (event) {

                table.search('').columns().search('').draw();
                table.columns(0).search('1').draw();
            });
            $("#Views").on("click", ".Over", function (event) {

                table.search('').columns().search('').draw();
                table.columns(1).search('1').draw();

            });
            $("#Views").on("click", ".Completed", function (event) {
                table.search('').columns().search('').draw();
                table.columns(9).search('100%').draw();

            });
            $("#Views").on("click", ".Open", function (event) {
                table.search('').columns().search('').draw();
                table.columns(10).search('1').draw();

            });

            var OverDueCount = 0;
            var NewCount = 0;

            $.each(data.d.results, function (i, result) {
                var PercentComplete = result.PercentComplete * 100;
                var date = new Date(result.Created);
                date = (date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear());
                var DueDate = "";
                var OverDue = 0;
                var IsNew = 0;
                var IsOpen = 0;
                var New = "";
                var Datenow = new Date();
                Datenow = (Datenow.getMonth() + 1 + '/' + Datenow.getDate() + '/' + Datenow.getFullYear());

                if (result.DueDate != null) {
                    DueDate = new Date(result.DueDate);
                    DueDate = (DueDate.getMonth() + 1 + '/' + DueDate.getDate() + '/' + DueDate.getFullYear());
                    if (new Date(DueDate) < new Date(Datenow) && PercentComplete < 100) {
                        OverDue = 1;
                        OverDueCount++;
                    }
                    if (PercentComplete < 100) {
                        IsOpen = 1;

                    }

                }
                if ((new Date(Datenow)).toLocaleDateString() == (new Date(date)).toLocaleDateString()) {
                    //   if ((new Date(Datenow)).getDate() == (new Date(date)).getDate()) {
                    NewCount++;
                    IsNew = 1;
                    New = "<span class='ms-newdocument-iconouter'><img class='ms-newdocument-icon' src='/_layouts/15/images/spcommon.png?rev=43#ThemeKey=' alt='new' title='new'></span>";
                }


                var MeetingName = "";
                if (result.Meeting.Title != null) {
                    MeetingName = result.Meeting.Title;
                }
                var AutherName = "";
                if (result.AssignedTo && result.AssignedTo.results && result.AssignedTo.results.length > 0) {
                    AutherName = result.AssignedTo.results[0].Title;
                }
                if (result.ExternalContacts && result.ExternalContacts.results && result.ExternalContacts.results.length > 0) {
                    AutherName += result.ExternalContacts.results[0].FirstName;
                }
                table.row.add([
                    IsNew,
                    OverDue,
                    "<a onclick=\"ActionDetilspop('" + result.ID + "')\"> <i class='fa fa-eye' aria-hidden='true'></i></a>",
                    result.Title + New,
                    MeetingName,
                    result.Author.Title,
                    date,
                    AutherName,
                    DueDate,
                    PercentComplete + "%",
                    IsOpen,
                    result.Body
                ]).draw(false);
            });
            $("#MyOverDueActionsCount").text(OverDueCount);
            $("#MyNewActionsCount").text(NewCount);
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function ActionDetilspop(id) {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Actions/EditForm.aspx?ID=" + id,
        title: "View / Edit Action",
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
    SP.UI.ModalDialog.showModalDialog({
        url: URL + "/Lists/Actions/NewForm.aspx",
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
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', GetActions);


