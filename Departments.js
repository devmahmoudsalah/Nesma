function AddNewDepartments() {
    var URL = _spPageContextInfo.webAbsoluteUrl;
    SP.UI.ModalDialog.showModalDialog({
        url: URL+"/Lists/Departments/NewForm.aspx",
        title: "Add New Department ",
        allowMaximize: true,showMaximized: true,
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
function GetAllDepartments() {
    $.when(CheckAdmin()).done(function (data) {
            if (data.d.results.length > 0) {
                $("#NewDepartments").show();
            }
            else {
                $("#NewDepartments").hide();
            }
        });

    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Departments')/items?$select=ID,Title,Created,DepartmentDesc&$orderby=Created desc",
        type: "Get",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            debugger;
            var table = $('#dataTables-example').DataTable({

                responsive: true,buttons: [
            'print'
        ],
"order": [[ 0, "desc" ]],
"columnDefs": [
                {
                    "targets": [0],
                    "visible": false
                }]
            });
            $.each(data.d.results, function (i, result) {
                var date = new Date(result.Created);
                date = (date.getMonth()+1 + '/' + date.getDate() + '/' + date.getFullYear());
                table.row.add([
date ,
                    "<div class='media'> <a href='Departmentdetilas.aspx?projectID=" + result.ID + "'><div class='pull-left'><span class='fa-stack fa-2x'><i class='fa fa-circle fa-stack-2x text-primary'></i><i class='fa fa-folder-open fa-stack-1x fa-inverse'></i></span></div></a><div class='media-body'><span style='float:right;margin-top:0 px'> " + date + "</span><a href='Departmentdetilas.aspx?DepID=" + result.ID + "'> <h4 class='media-heading'>" + result.Title+ "</h4></a><p>" + result.DepartmentDesc+ "</p></div></div>"
                ]).draw(false);
            });
        
        },
        error: function (data) {
            console.log(data);
        }
    });
}
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', GetAllDepartments);