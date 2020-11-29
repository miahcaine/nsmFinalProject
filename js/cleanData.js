function getStopCounts (data){
    let stopRaceObj = {
        0 : [""],
        1 : ["W"],
        2 : ["B"],
        3 : ["Z", "A"],
        4 : ["P", "Q"]
    }
    let stopObj = {
        1 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0},
        2 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0},
        3 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0},
        4 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0}
    }
    for (var i = 0; i < data.length; i++){
        for (var j = 0; j < data[i].length; j++){
            // white
            if (stopRaceObj[1].includes(data[i][j].race)){
                switch(data[i][j].city){
                    case "BRONX":
                        stopObj[1]["BRONX"]++;
                    case "BROOKLYN":
                        stopObj[1]["BROOKLYN"]++;
                    case "MANHATTAN":
                        stopObj[1]["MANHATTAN"]++;
                    case "QUEENS":
                        stopObj[1]["QUEENS"]++;
                    case "STATEN ISLAND":
                        stopObj[1]["STATEN ISLAND"]++;
                }
            }
            // black
            if (stopRaceObj[2].includes(data[i][j].race)){
                switch(data[i][j].city){
                    case "BRONX":
                        stopObj[2]["BRONX"]++;
                    case "BROOKLYN":
                        stopObj[2]["BROOKLYN"]++;
                    case "MANHATTAN":
                        stopObj[2]["MANHATTAN"]++;
                    case "QUEENS":
                        stopObj[2]["QUEENS"]++;
                    case "STATEN ISLAND":
                        stopObj[2]["STATEN ISLAND"]++;
                }
            }
            // "other"
            if (stopRaceObj[3].includes(data[i][j].race)){
                switch(data[i][j].city){
                    case "BRONX":
                        stopObj[3]["BRONX"]++;
                    case "BROOKLYN":
                        stopObj[3]["BROOKLYN"]++;
                    case "MANHATTAN":
                        stopObj[3]["MANHATTAN"]++;
                    case "QUEENS":
                        stopObj[3]["QUEENS"]++;
                    case "STATEN ISLAND":
                        stopObj[3]["STATEN ISLAND"]++;
                }
            }
            // hispanic
            if (stopRaceObj[4].includes(data[i][j].race)){
                switch(data[i][j].city){
                    case "BRONX":
                        stopObj[4]["BRONX"]++;
                    case "BROOKLYN":
                        stopObj[4]["BROOKLYN"]++;
                    case "MANHATTAN":
                        stopObj[4]["MANHATTAN"]++;
                    case "QUEENS":
                        stopObj[4]["QUEENS"]++;
                    case "STATEN ISLAND":
                        stopObj[4]["STATEN ISLAND"]++;
                }
            }
        }
    }
    for (var i = 1; i < 5; i++){
        stopObj[i]["Total"] = stopObj[i]["BRONX"] + stopObj[i]["BROOKLYN"] + stopObj[i]["MANHATTAN"] 
                                + stopObj[i]["QUEENS"] + stopObj[i]["STATEN ISLAND"];
    }
    return stopObj;
}

function getPopCounts (data) {
    // vis.boroughObj = {
    //     2 : "Total",
    //     3 : "BRONX",
    //     4 : "BROOKLYN",
    //     5 : "MANHATTAN",
    //     6 : "QUEENS",
    //     7 : "STATEN ISLAND"
    //   }
    let popObj = {
        1 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0},
        2 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0},
        3 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0},
        4 : {"Total": 0, "BRONX": 0, "BROOKLYN": 0, "MANHATTAN": 0, "QUEENS": 0, "STATEN ISLAND": 0}
    };
    for (var i = 0; i < data.length; i++){
        for (var j = 0; j < data[i].length; j++){
            if (data[i][j]["Gender Code"] == 0 && data[i][j]["Age Group Code"] == 0){ // TOTAL GENDER AND AGE GROUPS
                if(data[i][j]["County Code"] == 2){ // NYC 
                    switch (data[i][j]["Race Ethnicity Code"]){
                        case 1:
                            popObj[1]["Total"] += data[i][j]["Population"];
                        case 2:
                            popObj[2]["Total"] += data[i][j]["Population"];
                        case 3:
                            popObj[3]["Total"] += data[i][j]["Population"];
                        case 5:
                            popObj[4]["Total"] += data[i][j]["Population"];
                        
                    }
                }
                if(data[i][j]["County Code"] == 3){ // BRONX 
                    switch (data[i][j]["Race Ethnicity Code"]){
                        case 1:
                            popObj[1]["BRONX"] += data[i][j]["Population"];
                        case 2:
                            popObj[2]["BRONX"] += data[i][j]["Population"];
                        case 3:
                            popObj[3]["BRONX"] += data[i][j]["Population"];
                        case 5:
                            popObj[4]["BRONX"] += data[i][j]["Population"];
                        
                    }
                }
                if(data[i][j]["County Code"] == 4){ // BROOKLYN 
                    switch (data[i][j]["Race Ethnicity Code"]){
                        case 1:
                            popObj[1]["BROOKLYN"] += data[i][j]["Population"];
                        case 2:
                            popObj[2]["BROOKLYN"] += data[i][j]["Population"];
                        case 3:
                            popObj[3]["BROOKLYN"] += data[i][j]["Population"];
                        case 5:
                            popObj[4]["BROOKLYN"] += data[i][j]["Population"];
                    }
                }
                if(data[i][j]["County Code"] == 5){ // MANHATTAN 
                    switch (data[i][j]["Race Ethnicity Code"]){
                        case 1:
                            popObj[1]["MANHATTAN"] += data[i][j]["Population"];
                        case 2:
                            popObj[2]["MANHATTAN"] += data[i][j]["Population"];
                        case 3:
                            popObj[3]["MANHATTAN"] += data[i][j]["Population"];
                        case 5:
                            popObj[4]["MANHATTAN"] += data[i][j]["Population"];
                    }
                }
                if(data[i][j]["County Code"] == 6){ // QUEENS 
                    switch (data[i][j]["Race Ethnicity Code"]){
                        case 1:
                            popObj[1]["QUEENS"] += data[i][j]["Population"];
                        case 2:
                            popObj[2]["QUEENS"] += data[i][j]["Population"];
                        case 3:
                            popObj[3]["QUEENS"] += data[i][j]["Population"];
                        case 5:
                            popObj[4]["QUEENS"] += data[i][j]["Population"];
                    }
                }
                if(data[i][j]["County Code"] == 7){ // STATEN ISLAND 
                    switch (data[i][j]["Race Ethnicity Code"]){
                        case 1:
                            popObj[1]["STATEN ISLAND"] += data[i][j]["Population"];
                        case 2:
                            popObj[2]["STATEN ISLAND"] += data[i][j]["Population"];
                        case 3:
                            popObj[3]["STATEN ISLAND"] += data[i][j]["Population"];
                        case 5:
                            popObj[4]["STATEN ISLAND"] += data[i][j]["Population"];
                    }
                }
            }
        }
    }
    return popObj;
}