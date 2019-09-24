(function () {
    var dataset_url = "https://openspending.org/api/3/cubes/b9d2af843f3a7ca223eea07fb608e62a:budgeted-and-actual-national-expenditure-uploaded-2019-04-16t1104";
    var myConnector = tableau.makeConnector();
    var get_ref = function(model, dimension_name, ref_type) {
        return model.dimensions[dimension_name][ref_type + "_ref"];
    };
    var get_dimension = function(model, hierarchy_name, level) {
        level = typeof level !== 'undefined' ? level : 0;
        return model.hierarchies["hierarchy_name"].levels["level"];
    };
    var openspendingToTableauType = {
        string: tableau.dataTypeEnum.string,
        integer: tableau.dataTypeEnum.int,
    };
    myConnector.getSchema = function (schemaCallback) {
        var model_url = dataset_url + "/model/";
        $.getJSON(model_url, function(response) {
            var model = response.model;
            var cols = [];
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
                    cols.push({
                        id: columnId,
                        dataType: openspendingToTableauType[dimension.attributes[dimensionId].type]
                    });
                }
            };

            var tableSchema = {
                id: "spending",
                alias: "Spending Data",
                columns: cols
            };

            schemaCallback([tableSchema]);
        });
    };

    myConnector.getData = function (table, doneCallback) {
        var facts_url = dataset_url + "/facts/";
        $.getJSON(facts_url, function(resp) {
            var tableData = resp.data.map(function(row) {
                return {
                    "phase": row["budget_phase.budget_phase"],
                    "financial_year": row["financial_year.financial_year"],
                    "programme": row["programme_number.programme"],
                    "economic_classification": row["econ1.econ1"],
                    "amount": row["value"]
                };
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
