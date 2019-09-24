(function () {
    var dataset_url = "https://openspending.org/api/3/cubes/b9d2af843f3a7ca223eea07fb608e62a:budgeted-and-actual-national-expenditure-uploaded-2019-04-16t1104";

    var openspendingToTableauType = {
        string: tableau.dataTypeEnum.string,
        integer: tableau.dataTypeEnum.int,
    };


    var myConnector = tableau.makeConnector();
    myConnector.getSchema = function (schemaCallback) {
        var modelUrl = dataset_url + "/model/";
        $.getJSON(modelUrl, function(response) {
            var model = response.model;
            var cols = [];
            var refToCol = {};

            for (var hierarchyId in model.hierarchies) {
                var hierarchy = model.hierarchies[hierarchyId];
                for (var index = 0; index < hierarchy.levels.length; index++) {
                    var columnId;
                    if (index == 0)
                        columnId = hierarchyId;
                    else
                        columnId = hierarchyId + "_" + (index + 1);
                    var dimensionId = hierarchy.levels[index];
                    var dimension = model.dimensions[dimensionId];
                    var attribute = dimension.attributes[dimension.label_attribute];
                    cols.push({
                        id: columnId,
                        dataType: openspendingToTableauType[attribute.type]
                    });
                    refToCol[dimension.label_ref] = columnId;
                }
            };

            var tableSchema = {
                id: "spending",
                alias: "Spending Data",
                columns: cols
            };

            var persistentData = {
                refToCol: refToCol,
            };
            tableau.connectionData = JSON.stringify(persistentData);

            schemaCallback([tableSchema]);
        });
    };

    myConnector.getData = function (table, doneCallback) {
        var facts_url = dataset_url + "/facts/";
        $.getJSON(facts_url, function(resp) {
            var persistentData = JSON.parse(tableau.connectionData);
            var refToCol = persistentData.refToCol;
            var tableData = resp.data.map(function(openspendingRow) {
                tableauRow = {};
                for (var ref in refToCol) {
                    tableauRow[refToCol[ref]] = openspendingRow[ref];
                }
                return tableauRow;
            });

            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "Spending Data";
            tableau.submit();
        });
    });

})();
