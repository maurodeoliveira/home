  /*var max_g = 0;
        var min_g = 0;
        var markers = [];
        var map = L.map('map', { zoomControl: true });
        map.setView([-9.1899672, -75.015152], 4);

        function getColor(min, max, value) {
            return value >= min && value <= Math.round(max / 100, 0) ? 'green' :
                value >= min && value <= Math.round(max / 50, 0) ? 'yellow' : 'red';
        }


        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; OpenStreetMap contributors'
        }).addTo(map);



        var leftSidebar = L.control.sidebar('sidebar-left', {
            closeButton: true,
            position: 'left'
        });

        map.zoomControl.setPosition('topright');


        map.addControl(leftSidebar);

        var rightSidebar = L.control.sidebar('sidebar-right', {
            closeButton: true,
            position: 'right'
        });

        map.addControl(rightSidebar);

        map.on('click', function() {
            markers.forEach(function(d) {
                if (d._icon)
                    d._icon.hidden = false;
                //d._shadow.hidden = false;
            })

            leftSidebar.hide();
        })

        var layer_markers = L.featureGroup().addTo(map);
        var layer_regions = L.featureGroup().addTo(map);
        var layer_menu = L.featureGroup().addTo(map);

        queue()
            .defer(d3.json, "countries.json")
            .defer(d3.json, "regions.json")
            .defer(d3.json, "data.json")
            .await(function(error, countries, regions, data) {
                if (error) throw error;




                countries = countries.filter(function(d) { return d.Continente == 1; });
                data.forEach(function(e) {
                    let country = countries.filter(function(d) { return d.ISO3166A3 == e.iso3.trim() })[0];
                    e.latitude = country.latitude;
                    e.longitude = country.longitude;
                })

                var grouped_by_country = d3.nest()
                    .key(function(d) { return d.iso3.trim() })
                    .entries(data)

                var grouped_by_indicator = d3.nest()
                    .key(function(d) { return d.subject_name.trim() })
                    .entries(data)


                var dropdown = L.control({ position: 'topleft' });
                dropdown.onAdd = function(map) {
                    var div = L.DomUtil.create('div', 'info legend');
                    var indicator = ""
                    indicator += '<select class="dropdown">';
                    indicator += '<option value="99">All</option>';
                    grouped_by_indicator.forEach(function(f) {
                        indicator += '<option value="' + f.values[0].subject_id + '"">' + f.key + '</option>';
                    });

                    indicator += '</select>';
                    div.innerHTML = indicator;

                    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
                    return div;
                };


                dropdown.addTo(map);



                $('select').change(function() {
                    drawMarkers(data, grouped_by_country, countries, $(this).val());
                });


                L.geoJSON(regions, {
                    style: function(feature) {
                        if (feature.properties.region_un == 'Asia')
                            return { color: 'red', "weight": 1, dashArray: '3' };

                        if (feature.properties.region_un == 'Europe')
                            return { color: 'yellow', "weight": 1, dashArray: '3' };

                        if (feature.properties.region_un == 'Africa')
                            return { color: 'blue', "weight": 1, dashArray: '3', };

                        if (feature.properties.region_un == 'Oceania')
                            return { color: 'green', "weight": 1, dashArray: '3', };

                    }
                }).addTo(layer_regions);


                drawMarkers(data, grouped_by_country, countries)

            })


        var drawMarkers = function(data, grouped_by_country, countries, subject_id = 99) {

            for (i = 0; i < markers.length; i++) {
                map.removeLayer(markers[i]);
            }

            markers = [];
            var ModelIcon = L.Icon.extend({});

            grouped_by_country.forEach(function(e, i) {
                var type = data.filter(function(d) { return d.subject_id == subject_id })[0]
                var value = e.values.filter(function(j) { return j.iso3 == e.key && j.subject_id == subject_id })[0];
                if (value && type && type.type == 'Numeric') {
                    if (value.description > 1 && value.description < min_g)
                        min_g = value.description;

                    if (value.description > max_g)
                        max_g = value.description;
                }
            })

            grouped_by_country.forEach(function(e, i) {

                icon = new ModelIcon({ iconUrl: 'marker-icon-black.png' });
                country = countries.filter(function(d) { return d.ISO3166A3 == e.key; })[0];

                if (subject_id != 99) {
                    var type = data.filter(function(d) { return d.subject_id == subject_id })[0]
                    var value = e.values.filter(function(j) { return j.iso3 == e.key && j.subject_id == subject_id })[0];
                    if (value != undefined) {
                        if (type.type == 'Boolean') {
                            if (value.description == 1)
                                icon = new ModelIcon({ iconUrl: 'marker-icon-green.png' });
                            else
                                icon = new ModelIcon({ iconUrl: 'marker-icon-red.png' });
                        } else {
                            if (type.type == 'Numeric') {
                                /*console.log(value);*/
        /*min = d3.min(values, function(d) { return d.description });
        max = d3.max(values, function(d) { return d.description });*/
        /*if (value.description > 1 &&  value.description < min_g)
                                    min_g = value.description;

                                if (value.description > max_g)
                                    max_g = value.description;
                            }
                        }
                    }
                }

                if (value && type && type.type == 'Numeric') {
                    var marker = L.marker([country.latitude, country.longitude], { icon: new ModelIcon({ iconUrl: 'marker-icon-' + getColor(min_g, max_g, value.description) + '.png' }) }).addTo(layer_markers);
                } else {
                    var marker = L.marker([country.latitude, country.longitude], { icon: icon }).addTo(layer_markers);
                }





                if (marker) {
                    marker.on('click', function(x) {


                        markers.forEach(function(d) {
                            if (d._icon)
                                d._icon.hidden = true;
                            //d._shadow.hidden = true;
                        })

                        var indicator = "";


                        e.values.forEach(function(d) {
                            if (d.type == 'Boolean') {
                                if (d.description == 1)
                                    description = "TRUE";
                                else
                                    description = "FALSE";
                            } else {
                                description = d.description;
                            }

                            indicator += "<p class='" + ((d.subject_id != 99 && d.subject_id != subject_id) ? 'notfiltered' : '') + "'><b>" + d.subject_name + "</b> - <label class='badge badge-danger'>" + description + "</label></p>";
                        })

                        $(this)[0]._icon.hidden = false;
                        //$(this)[0]._shadow.hidden = true;
                        $('.country').text(e.values[0].country_name)
                        $('.indicator').html(indicator);
                        $('.test2').text(Math.floor(Math.random() * 1000) + 1);
                        leftSidebar.toggle();
                    });


                    marker.bindPopup(country.DescripcionING);
                    $(marker._icon).addClass(e.key);
                    markers.push(marker);
                }
            })


            if (subject_id != 99) {



                if (legend != undefined)
                    map.removeControl(legend);

                legend = L.control({ position: 'bottomright' });

                legend.onAdd = function(map) {

                    var div = L.DomUtil.create('div', 'info legend'),
                        grades = [min_g, Math.round(max_g / 100), Math.round(max_g / 50)],
                        labels = ['green', 'yellow', 'red'];

                    // loop through our density intervals and generate a label with a colored square for each interval
                    for (var i = 0; i < grades.length; i++) {
                        div.innerHTML +=
                            '<i style="background:' + labels[i] + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }

                    return div;
                };

                legend.addTo(map);

            }
        }*/