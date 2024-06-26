class EcoMap {
    constructor (id, option, mini, index=0) {
        this.root = am5.Root.new(id);
        this.countries = null
        this.continents = null
        this.allContinents = {}
        this.continentActive = null
        this.poly = []
        this.incr = 0
        this.cities = null
        this.capitals = null
        this.option = option
        this.mini = mini
        this.index = index
        this.heatLegend = null
        this.data = null
        
        this.cluster3 = null
        this.cluster3Legend = null
        this.cluster8 = null
        this.cluster8Legend = null

        this.root.setThemes([
            am5themes_Animated.new(this.root)
        ]);

        this.map = this.root.container.children.push(am5map.MapChart.new(this.root, {
            panX: "translateX",
            panY: "translateY",
            wheelX: "none",
            projection: am5map.geoNaturalEarth1(),
        }));
    }

    addCountries() {
        var base = this

        this.countries = this.map.series.push(am5map.MapPolygonSeries.new(base.root, {
            geoJSON: am5geodata_worldLow,
            geodataNames:am5geodata_lang_FR,
            exclude: ["AX","BL","BQ","BV","CW","HM","MF","SJ","SS","SX","TL","UM","AF","AQ","CC","CX","EH","FK","FO","GG","GI","GL","GQ","GS","IM","IO","JE","KP","LR","NF","NR","PM","PN","SH","SO","SZ","TF","TK","VA","WF","YT","AI","CK","GF","GP","KN","MQ","MS","NU","PS","RE","TW","ST","MR"],
            valueField:"score",
            calculateAggregates: true,
            fill:am5.color("#222")
        }));    
        this.behaviorSerie(this.countries)
        this.activePays(this.countries)
    }

    addContinents() {
        var base = this

        this.continents = this.map.series.push(am5map.MapPolygonSeries.new(base.root, {
            geoJSON: am5geodata_continentsLow,
            geodataNames:am5geodata_lang_FR,
            exclude: ["AX","BL","BQ","BV","CW","HM","MF","SJ","SS","SX","TL","UM","AF","AQ","CC","CX","EH","FK","FO","GG","GI","GL","GQ","GS","IM","IO","JE","KP","LR","NF","NR","PM","PN","SH","SO","SZ","TF","TK","VA","WF","YT","AI","CK","GF","GP","KN","MQ","MS","NU","PS","RE","TW","ST","MR"],
            visible: false,
            fill:am5.color("#222")
        }));
    }

    addThisContinent(id) {
        var json
        var base = this
        if (id == "asia") {
            json = am5geodata_region_world_asiaLow
        } else if (id == "america") {
            this.addThisContinent("southAmerica")
            json = am5geodata_region_world_northAmericaLow
        } else if (id == "africa") {
            json = am5geodata_region_world_africaLow
        } else if (id == "europe") {
            json = am5geodata_region_world_europeLow
        } else if (id == "oceania") {
            json = am5geodata_region_world_oceaniaLow
        } else if (id == "southAmerica") {
            json = am5geodata_region_world_southAmericaLow
        }

        var s = this.map.series.push(am5map.MapPolygonSeries.new(base.root, {
            geoJSON: json,
            geodataNames:am5geodata_lang_FR,
            exclude: ["AX","BL","BQ","BV","CW","HM","MF","SJ","SS","SX","TL","UM","AF","AQ","CC","CX","EH","FK","FO","GG","GI","GL","GQ","GS","IM","IO","JE","KP","LR","NF","NR","PM","PN","SH","SO","SZ","TF","TK","VA","WF","YT","AI","CK","GF","GP","KN","MQ","MS","NU","PS","RE","TW","ST","MR"],
            visible: false,
            fill:am5.color("#222")
        }));

        this.allContinents[id] = s
        this.behaviorSerie(s)
        this.activePays(s)
    }

    behaviorSerie(serie) {
        var base = this

        serie.mapPolygons.template.setAll({
            tooltipText: "{name}",
            toggleKey: "active",
            interactive: true,
            tooltip: am5.Tooltip.new(base.root, {
                labelHTML: `<div style="display:flex;gap:10px"><img style="width: 25px;height: 25px;" src='assets/twemoji/{id}.svg'> <p style="margin:auto">{name}</p></div>`,
            }),
        });
        
        serie.mapPolygons.template.states.create("hover", {
            fill: am5.color("#52796F"),
        });
    
        serie.mapPolygons.template.states.create("active", {
            fill: am5.color("#52796F")
        });
    }

    activePays(serie) {
        var base = this

        serie.mapPolygons.template.on("active", function(active, target) {
            if (active) {
                var max = 1
                target.set("interactive",false)
                if (base.incr == max) {
                    base.incr = 0
                }
                if (base.poly.length < max) {
                    base.poly.push(target)
                } else {
                    base.poly[base.incr].set("active", false)
                    base.poly[base.incr].set("interactive", true)
                    base.poly[base.incr] = target
                }
                base.incr++
            }
        })

        serie.mapPolygons.template.events.on("click", function (ev) {
            if (base.mini) {
                if (base.option == "pays") {
                    htmx.ajax("GET","scripts/htmx/getPays.php",{values:{id_pays:ev.target.dataItem._settings.id},swap:"beforeend"})
                } else if (base.option == "comparateur") {
                    htmx.ajax("GET","scripts/htmx/getCompare.php",{values:{id_pays:ev.target.dataItem._settings.id,incr:base.index},swap:"beforeend"})
                }
            
            } else {
                if (base.option == "pays") {
                    htmx.ajax("GET","pays.php",{values:{id_pays:ev.target.dataItem._settings.id},swap:"outerHTML swap:0.5s",target:"#zones",select:"#zones"})
                } else if (base.option == "comparateur") {
                    htmx.ajax("GET","scripts/htmx/appendCompare.php",{values:{id_pays:ev.target.dataItem._settings.id,incr:getIncr()},swap:"beforeend"})
                } else if (base.option == "explorer") {
                    htmx.ajax("GET","scripts/htmx/getExplore.php",{values:{id_pays:ev.target.dataItem._settings.id},swap:"beforeend"})
                }else if (base.option == "continent") {
                    htmx.ajax("GET","scripts/htmx/appendContinent.php",{values:{id_pays:ev.target.dataItem._settings.id},swap:"beforeend"})
                }
            }
        });
    }
    
    addZoom() {
        var base = this

        var zoom = this.map.set("zoomControl", am5map.ZoomControl.new(base.root, {}));
        zoom.homeButton.set("visible", true)
        zoom.minusButton.get("background").setAll({
            fill: am5.color("#52796F")
        })
        zoom.plusButton.get("background").setAll({
            fill: am5.color("#52796F")
        })
        zoom.homeButton.get("background").setAll({
            fill: am5.color("#52796F")
        })
    }

    addBullets(radius,color,data) {
        var base = this

        var serie = this.map.series.push(
            am5map.MapPointSeries.new(base.root, {})
        );
    
        serie.bullets.push(function() {
            var circle = am5.Circle.new(base.root, {
                radius: radius,
                tooltipText: "{title}",
                tooltipY: 0,
                fill: color,
                stroke: base.root.interfaceColors.get("background"),
                strokeWidth: 2
            });
    
            return am5.Bullet.new(base.root, {
                sprite: circle
            });
        });
    
        serie.data.setAll(data);
    
        return serie
    }  

    addCities(data) {
        if (this.cities != null) {
            this.cities.data.setAll(data)
        } else {
            this.cities = this.addBullets(5,am5.color(0xffba00),data)
        }
    }

    addCapitals(data) {
        if (this.capitals != null) {
            this.capitals.data.setAll(data)
        } else {
            this.capitals = this.addBullets(6,am5.color(0xb8602e),data)
        }
    }

    zoomTo(id_pays) {
        this.countries.zoomToDataItem(this.setActive(id_pays));
    }

    setActive(id_pays) {
        var elem = this.countries.getDataItemById(id_pays)
        elem._settings.mapPolygon.set("active",true)
        return elem
    }

    zoomToContinent(id_continent) {
        if (id_continent in this.allContinents == false) {
            this.addThisContinent(id_continent)
        }
        if (this.continentActive != null) {
            this.allContinents[this.continentActive].hide()
            if (this.continentActive == "america") {
                this.allContinents["southAmerica"].hide()
            }
        }
        
        this.continentActive = id_continent
        this.allContinents[id_continent].show()
        if (id_continent != "america") {
            var elem = this.continents.getDataItemById(id_continent)
        } else {
            this.allContinents["southAmerica"].show()
            var elem = this.continents.getDataItemById("northAmerica")
        }
        this.continents.zoomToDataItem(elem)
    }

    addHeat(data) {
        var base = this
        this.data = data

        this.countries.set("heatRules", [{
            target: base.countries.mapPolygons.template,
            dataField: "value",
            min: am5.color(0xCAD2C5),
            max: am5.color(0x354F52),
            key: "fill",
        }]);
            
        this.countries.mapPolygons.template.events.on("pointerover", function(ev) {
            if (ev.target.dataItem.get("value") == null) {
                base.heatLegend.showValue(0, "Pas de données");
            } else {
                base.heatLegend.showValue(ev.target.dataItem.get("value"));
            }
            
        });

        this.countries.events.on("datavalidated", function () {
            base.heatLegend.set("startValue", base.countries.getPrivate("valueLow"));
            base.heatLegend.set("endValue", base.countries.getPrivate("valueHigh"));
        });

        this.heatLegend = this.map.children.push(am5.HeatLegend.new(base.root, {
            orientation: "horizontal",
            startColor: am5.color(0xCAD2C5),
            endColor: am5.color(0x354F52),
            startText: base.countries.getPrivate("valueLow"),
            endText: base.countries.getPrivate("valueHigh"),
            stepCount: 5
        }));
          
        this.heatLegend.startLabel.setAll({
            fontSize: 12,
            fill: base.heatLegend.get("startColor")
        });
          
        this.heatLegend.endLabel.setAll({
            fontSize: 12,
            fill: base.heatLegend.get("endColor")
        });

        this.countries.data.setAll(data)
        updatePodium("score",data)
    }

    addCluster(nb) {
        var base = this
        if (nb == 3 && this.cluster3 == undefined) {
            var build = true
            var data = [{"name":"Cluster 1", "data":[{"id":'EC'}, {"id":'MU'}, {"id":'MY'}, {"id":'PA'}, {"id":'BY'}, {"id":'UY'}, {"id":'CR'}, {"id":'TT'}, {"id":'KZ'}, {"id":'OM'}, {"id":'RO'}, {"id":'RU'}, {"id":'ME'}, {"id":'TR'}, {"id":'AR'}, {"id":'SK'}, {"id":'CL'}, {"id":'HR'}, {"id":'LV'}, {"id":'SA'}, {"id":'LT'}, {"id":'GR'}, {"id":'EE'}, {"id":'CY'}, {"id":'IL'}, {"id":'GE'}, {"id":'RS'}, {"id":'MN'}, {"id":'RS'}, {"id":'EG'}, {"id":'UZ'}, {"id":'JO'}, {"id":'PY'}, {"id":'GY'}, {"id":'ZA'}, {"id":'JM'}, {"id":'LB'}, {"id":'ID'}, {"id":'VN'}, {"id":'AZ'}, {"id":'DZ'}, {"id":'CO'}, {"id":'BR'}, {"id":'MX'}, {"id":'PE'}, {"id":'DO'}, {"id":'CN'}, {"id":'UA'}, {"id":'BA'}, {"id":'LK'}, {"id":'BG'}, {"id":'AL'}, {"id":'AM'}]},
            {"name":"Cluster 2", "data":[{"id":'NP'}, {"id":'LA'}, {"id":'ZW'}, {"id":'KH'}, {"id":'HN'}, {"id":'AO'}, {"id":'MM'}, {"id":'NA'}, {"id":'BD'}, {"id":'GT'}, {"id":'GH'}, {"id":'IN'}, {"id":'KE'}, {"id":'BT'}, {"id":'NI'}, {"id":'SV'}, {"id":'MA'}, {"id":'TJ'}, {"id":'CM'}, {"id":'NG'}, {"id":'ZM'}, {"id":'PG'}, {"id":'ML'}, {"id":'MZ'}, {"id":'BF'}, {"id":'SL'}, {"id":'GW'}, {"id":'ET'}, {"id":'MG'}, {"id":'DJ'}, {"id":'MW'}, {"id":'PH'}, {"id":'LS'}, {"id":'UG'}, {"id":'BJ'}, {"id":'RW'}, {"id":'CF'}, {"id":'HT'}, {"id":'TG'}, {"id":'KG'}, {"id":'NE'}]},
            {"name":"Cluster 3","data":[{"id":'CH'}, {"id":'US'}, {"id":'IS'}, {"id":'KW'}, {"id":'QA'}, {"id":'BH'}, {"id":'PL'}, {"id":'IT'}, {"id":'FR'}, {"id":'ES'}, {"id":'AE'}, {"id":'AT'}, {"id":'HU'}, {"id":'JP'}, {"id":'GB'}, {"id":'CA'}, {"id":'NZ'}, {"id":'BE'}, {"id":'IE'}, {"id":'SG'}, {"id":'DK'}, {"id":'NL'}, {"id":'DE'}, {"id":'AU'}]}]
        } else if (nb == 8 && this.cluster8 == undefined) {
            var build = true
            var data = [{'name':'Cluster 1','data':[{'id':'RS'}, {'id':'MN'}, {'id':'CO'}, {'id':'BR'}, {'id':'PY'}, {'id':'DO'}, {'id':'ZA'}, {'id':'UA'}, {'id':'LB'}, {'id':'BA'}, {'id':'RS'}, {'id':'DZ'}, {'id':'BY'}, {'id':'CR'}, {'id':'TT'}, {'id':'KZ'}, {'id':'RU'}, {'id':'ME'}, {'id':'TR'}, {'id':'AR'}, {'id':'AZ'}]},
            {'name':'Cluster 2','data':[{'id':'TG'}, {'id':'CM'}, {'id':'KE'}, {'id':'MM'}, {'id':'ZM'}, {'id':'PG'}, {'id':'NP'}, {'id':'NG'}, {'id':'BJ'}, {'id':'LS'}, {'id':'MG'}, {'id':'ET'}, {'id':'BF'}, {'id':'MZ'}, {'id':'ML'}, {'id':'UG'}, {'id':'NE'}, {'id':'ZW'}, {'id':'GH'}, {'id':'BD'}]},
            {'name':'Cluster 3','data':[{'id':'CH'}, {'id':'CA'}, {'id':'DK'}, {'id':'SG'}, {'id':'NZ'}, {'id':'NL'}, {'id':'DE'}, {'id':'IE'}, {'id':'QA'}, {'id':'AE'}, {'id':'IS'}, {'id':'AT'}, {'id':'AU'}, {'id':'BE'}]},
            {'name':'Cluster 4','data':[{'id':'DJ'}, {'id':'GW'}, {'id':'CF'}]},
            {'name':'Cluster 5','data':[{'id':'PL'}, {'id':'IT'}, {'id':'FR'}, {'id':'ES'}, {'id':'US'}, {'id':'CN'}, {'id':'MX'}]},
            {'name':'Cluster 6','data':[{'id':'MA'}, {'id':'GY'}, {'id':'UZ'}, {'id':'TJ'}, {'id':'JO'}, {'id':'PE'}, {'id':'KG'}, {'id':'GE'}, {'id':'JM'}, {'id':'ID'}, {'id':'LK'}, {'id':'AL'}, {'id':'VN'}, {'id':'PH'}, {'id':'AM'}, {'id':'SV'}, {'id':'HN'}, {'id':'AO'}, {'id':'KH'}, {'id':'LA'}, {'id':'NI'}, {'id':'NA'}, {'id':'EC'}, {'id':'GT'}, {'id':'IN'}, {'id':'BT'}, {'id':'EG'}]},
            {'name':'Cluster 7','data':[{'id':'SK'}, {'id':'CL'}, {'id':'MU'}, {'id':'BH'}, {'id':'LT'}, {'id':'SA'}, {'id':'LV'}, {'id':'HR'}, {'id':'HU'}, {'id':'MY'}, {'id':'EE'}, {'id':'PA'}, {'id':'UY'}, {'id':'KW'}, {'id':'RO'}, {'id':'GR'}, {'id':'OM'}, {'id':'BG'}, {'id':'IL'}, {'id':'JP'}, {'id':'CY'}, {'id':'GB'}]},
            {'name':'Cluster 8','data':[{'id':'SL'}, {'id':'MW'}, {'id':'RW'}, {'id':'HT'}]}]
        }

        if (build) {

            // Add legend
            var legend = map.map.children.push(am5.Legend.new(base.root, {
                useDefaultMarker: true,
                centerX: am5.p50,
                x: am5.p50,
                centerY: am5.p100,
                y: am5.p100,
                dy: -20,
                background: am5.RoundedRectangle.new(base.root, {
                fill: am5.color(0xffffff),
                fillOpacity: 0.2
                })
            }));
            
            legend.valueLabels.template.set("forceHidden", true)
            
            // Create series for each group
            var colors = am5.ColorSet.new(base.root, {
                step: 1
            });
            colors.next();

            var listSeries = []
            
            am5.array.each(data, function(group) {
                var countries = [];
                colors.next()
                colors.next()
                var color = colors.next();
            
                am5.array.each(group.data, function(country) {
                countries.push(country.id)
                });
            
                var polygonSeries = base.map.series.push(am5map.MapPolygonSeries.new(base.root, {
                geoJSON: am5geodata_worldLow,
                include: countries,
                name: group.name,
                geodataNames:am5geodata_lang_FR,
                fill: color
                }));
            
            
                polygonSeries.mapPolygons.template.setAll({
                tooltipText: "[bold]{name}[/]",
                interactive: true,
                fill: color,
                strokeWidth: 1,
                });
            
                polygonSeries.mapPolygons.template.states.create("hover", {
                fill: am5.Color.brighten(color, -0.3)
                });
            
                polygonSeries.mapPolygons.template.events.on("pointerover", function(ev) {
                ev.target.series.mapPolygons.each(function(polygon) {
                    polygon.states.applyAnimate("hover");
                });
                });
            
                polygonSeries.mapPolygons.template.events.on("pointerout", function(ev) {
                ev.target.series.mapPolygons.each(function(polygon) {
                    polygon.states.applyAnimate("default");
                });
                });
                polygonSeries.data.setAll(group.data);
            
                legend.data.push(polygonSeries);
                listSeries.push(polygonSeries)
            });

            if (nb == 3) {
                this.cluster3 = listSeries
                this.cluster3Legend = legend
            } else {
                this.cluster8 = listSeries
                this.cluster8Legend = legend
            }
        }

        if (nb == 3) {
            if (this.cluster8 != undefined) {
                this.cluster8.forEach(element => {
                    element.hide()
                });
                this.cluster8Legend.hide()
            }

            this.cluster3.forEach(element => {
                element.show()
            });
            this.cluster3Legend.show()
        } else if (nb == 8) {
            if (this.cluster3 != undefined) {
                this.cluster3.forEach(element => {
                    element.hide()
                });
                this.cluster3Legend.hide()
            }

            this.cluster8.forEach(element => {
                element.show()
            });
            this.cluster8Legend.show()
        }
    }
}

var map = undefined
var miniMap = {0:undefined,1:undefined}

function createMiniMap(index,option) {
    mi = new EcoMap("miniMap"+index,option,true,index)
    mi.addCountries()
    miniMap[index] = mi
}

function createMapCatalogue(option) {
    map = new EcoMap("map",option,false)
    map.addContinents()
    map.addZoom()

    map.root.events.on("frameended",() => {
        map.zoomToContinent("europe")
        map.root.events.off("frameended")
    })
}

function createMapExplorer(data) {
    map = new EcoMap("map","explorer",false)
    map.addCountries()
    map.addZoom()
    map.addHeat(data)
}

function createMapAnalyse(option) {
    map = new EcoMap("map",option,false)
    map.addZoom()
}

function changeCluster(nb) {
    map.addCluster(nb)
}


