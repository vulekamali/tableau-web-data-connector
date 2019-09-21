(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            {
                id: "phase",
                alias: "Budget Phase",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "financial_year",
                alias: "Financial Year",
                dataType: tableau.dataTypeEnum.integer
            },
            {
                id: "programme",
                alias: "Programme",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "economic_classification",
                alias: "Economic Classification",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "amount",
                dataType: tableau.dataTypeEnum.float
            }
        ];

        var tableSchema = {
            id: "spending",
            alias: "Spending Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    myConnector.getData = function (table, doneCallback) {
        var facts_url = "https://openspending.org/api/3/cubes/b9d2af843f3a7ca223eea07fb608e62a:budgeted-and-actual-national-expenditure-uploaded-2019-04-16t1104/facts/";
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
