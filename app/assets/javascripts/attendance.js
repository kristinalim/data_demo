$(document).on("turbolinks:load", function() {

    if ($("body").hasClass("attendance_filter")) {
        function filterHeaders(data) {
            if (data.school_name !== 'school_name') {
                return true;
            } else {
                return false;
            }
        }

        $(document).on('click', '.attendances-select-all', function() {
            var oTable = $('#attendance-filtered-table').DataTable();
            var rows = oTable.rows({search: 'applied'}).nodes();

            $('[name="attendance_ids[]"]', rows).prop('checked', this.checked);
        });

        $(document).on('click', '[name="attendance_ids[]"]', function() {
            $('.attendances-select-all').prop('checked', false);
        });

        $('#attendance-filtered-table').on('search.dt', function() {
            if ($('.attendances-select-all').is(':checked')) {
                $('.attendances-select-all').prop('checked', false);
            }
        });

        $('[data-toggle="hover"]').popover({
            trigger: 'hover'
        });

        var d3variable = gon.attendanceFilter;
        d3variable = d3.csv.parse(d3variable);
        var d3variable = d3variable.filter(filterHeaders);
        console.log(d3variable);
        var makeGraphs = makeAttendanceGraphs(d3variable);

        // Super hacky way of recalculating percentage
        window.setInterval(function() {
            var presentDays = $('#days-present').children().text();
            var membershipDays = $('#days-in-membership').children().text();
            percent = Number(presentDays / membershipDays);
            var chronicStudents = $('#chronic-students').children().text();
            var totalStudents = $('#total-students').children().text();
            percentChronic = Number(chronicStudents / totalStudents)
            if (!isNaN(percent)) {
                $('#attendance-percent').text(Math.round(10000 * percent) / 100 + '%');
            }
            if (!isNaN(percentChronic) && isFinite(percentChronic)) {
                $('#chronic-percent').text(Math.round(1000 * percentChronic) / 10 + '%');
            }
        }, 100);

        function makeAttendanceGraphs(apiData) {

            var dataSet = apiData;
            dataSet.forEach(function(d) {
                d.in_membership = Number(d.in_membership);
                d.present = Number(d.present);
            });

            var ndx = crossfilter(dataSet);

            // Define Dimensions
            var ethnicity = ndx.dimension(function(d) {
                return "" + d.ETHNICITY;
            });

            var gender = ndx.dimension(function(d) {
                return "" + d.GENDER;
            });

            var grade_level = ndx.dimension(function(d) {
                return d.GRADE_LEVEL;
            });

            var ell = ndx.dimension(function(d) {
                return "" + d.OK_ELL;
            });

            var idea = ndx.dimension(function(d) {
                return "" + d.OK_IDEA;
            });

            var school = ndx.dimension(function(d) {
                return d.school_name;
            });

            var all = ndx.groupAll();

            var attendanceByEthnicity = ethnicity.group();
            var attendanceByGender = gender.group();
            var attendanceByGradeLevel = grade_level.group();
            var attendanceByEll = ell.group();
            var attendanceByIdea = idea.group();
            var attendanceBySchool = school.group();
            var avgDaysInMembership = ndx.groupAll().reduceSum(function(d) {
                return Math.round(d.in_membership);
            });
            var avgDaysPresent = ndx.groupAll().reduceSum(function(d) {
                return Math.round(d.present);
            });
            var chronicallyAbsent = ndx.groupAll().reduceSum(function(d) {
                return Math.round(d.chronic_abs);
            });

            // Charts
            var ethnicityChart = dc.rowChart('#ethnicity-chart');
            var genderChart = dc.pieChart('#gender-chart');
            var gradeLevelChart = dc.rowChart('#grade-chart');
            var ellChart = dc.rowChart('#ell-chart');
            var ideaChart = dc.rowChart('#sped-chart');
            var totalStudents = dc.numberDisplay('#total-students');
            var daysPresent = dc.numberDisplay('#days-present');
            var daysInMembership = dc.numberDisplay('#days-in-membership');
            var chronicallyAbsentStudents = dc.numberDisplay('#chronic-students');

            // Chart Options

            totalStudents
                .formatNumber(d3.format("d"))
                .valueAccessor(function(d) {
                    return d;
                })
                .group(all);

            daysPresent
                .formatNumber(d3.format("d"))
                .valueAccessor(function(d) {
                    return Math.round(d);
                })
                .group(avgDaysPresent);

            daysInMembership
                .formatNumber(d3.format("d"))
                .valueAccessor(function(d) {
                    return Math.round(d);
                })
                .group(avgDaysInMembership);

            chronicallyAbsentStudents
                .formatNumber(d3.format("d"))
                .valueAccessor(function(d) {
                    return d;
                })
                .group(chronicallyAbsent);

            selectField = dc.selectMenu('#menuselect')
                .dimension(school)
                .group(attendanceBySchool);

            ethnicityChart
                .height(250)
                .dimension(ethnicity)
                .group(attendanceByEthnicity)
                .elasticX(true)
                .xAxis().ticks(5);

            genderChart
                .height(250)
                .radius(90)
                .innerRadius(40)
                .transitionDuration(1000)
                .dimension(gender)
                .group(attendanceByGender);

            gradeLevelChart
                .height(250)
                .dimension(grade_level)
                .group(attendanceByGradeLevel)
                .elasticX(true)
                .xAxis().ticks(5);

            ellChart
                .height(250)
                .dimension(ell)
                .group(attendanceByEll)
                .elasticX(true)
                .xAxis().ticks(5);

            ideaChart
                .height(250)
                .dimension(idea)
                .group(attendanceByIdea)
                .elasticX(true)
                .xAxis().ticks(5);

            dc.dataCount("#row-selection")
                .dimension(ndx)
                .group(all);

            var generateAttendanceLetters = function(locale) {
                var ids = $.map($('[name="attendance_ids[]"]:checked'), function(field) {
                    return $(field).attr('value');
                });

                if (ids.length) {
                    var url = '/attendance/letters.pdf?' + $.param({locale: locale, attendance_ids: ids});
                    console.log(url);

                    var request = new XMLHttpRequest();
                    request.open('GET', url, true);
                    request.responseType = 'arraybuffer';
                    request.onload = function(event) {
                        var blob = new Blob([request.response], {type: 'application/pdf'});
                        saveAs(blob, 'AttendanceLetters.pdf');
                    };
                    request.onerror = function() {
                        alert('There was an error generating the letters.');
                    };
                    request.send();
                } else {
                    alert('Please select students for whom to generate letters.');
                }
            };

            //table
            var dataTableOptions = {
                "lengthMenu": [
                    [10, 25, 50, -1],
                    [10, 25, 50, "All"]
                ],
                "footerCallback": function(row, data, start, end, display) {
                    var api = this.api(),
                        data;
                },
                "order": [
                    [3, 'desc']
                ],
                scrollX: true,
                colReorder: true,
                sDom: '<"col-sm-3"<"text-left"i>><"col-sm-5 text-center"B><"col-sm-4"f>rt<"col-sm-4"l><"col-sm-8"p>',
                buttons: [{
                    extend: 'excelHtml5',
                    title: 'Attendance Table'
                }, {
                    extend: 'csvHtml5',
                    title: 'Attendance Table'
                }, {
                    extend: 'collection',
                    text: 'Generate Letter',
                    className: 'generate-letter-button',
                    buttons: [
                        {
                            text: 'English',
                            action: function(e, dt, node, config) {
                                generateAttendanceLetters('en');
                            }
                        }, {
                            text: 'Spanish',
                            action: function(e, dt, node, config) {
                                generateAttendanceLetters('es');
                            }
                        },
                    ]
                }],
                columnDefs: [{
                        targets: 0,
                        width: '30px',
                        orderable: false,
                        data: function(d) {
                            return ('<input type="checkbox" name="attendance_ids[]" value="' + d.STUDENTID + '" />');
                        }
                    }, {
                        targets: 1,
                        width: '200px',
                        data: function(d) {
                            return (d.LASTFIRST);
                        }
                    }, {
                        targets: 2,
                        width: '100px',
                        data: function(d) {
                            return (d.STUDENT_NUMBER);
                        }
                    }, {
                        targets: 3,
                        width: '50px',
                        data: function(d) {
                            return (d.present);
                        }
                    }, {
                        targets: 4,
                        width: '50px',
                        data: function(d) {
                            return (d.in_membership);
                        }
                    }, {
                        targets: 5,
                        width: '50px',
                        data: function(d) {
                            return (Math.round(d.percent_attn));
                        }
                    }, {
                        targets: 6,
                        width: '50px',
                        data: function(d) {
                            return (d.abs);
                        }
                    }, {
                        targets: 7,
                        width: '50px',
                        data: function(d) {
                            return (d.chronic);
                        }
                    }, {
                        targets: 8,
                        width: '50px',
                        data: function(d) {
                            return (d.GRADE_LEVEL);
                        }
                    }, {
                        targets: 9,
                        width: '100px',
                        data: function(d) {
                            return (d.ETHNICITY)
                        }
                    }, {
                        targets: 10,
                        width: '50px',
                        data: function(d) {
                            return (d.GENDER)
                        }
                    }, {
                        targets: 11,
                        width: '50px',
                        data: function(d) {
                            return (d.OK_ELL)
                        }
                    }, {
                        targets: 12,
                        width: '250px',
                        data: function(d) {
                            return (d.school_name);
                        }
                    }
                ],
                createdRow: function(row, data, index) {
                    if (data['chronic'] == 'Yes' || data['chronic'] == 'YES') {
                        $('td', row).parent().addClass('danger');
                    }
                    if (true) {
                        $('td', row).parent().addClass('text-center');
                    }
                }
            };

            var datatable = $('#attendance-filtered-table').dataTable(dataTableOptions);

            function RefreshTable() {
                dc.events.trigger(function() {
                    datatable.api()
                        .clear()
                        .rows.add(school.top(Infinity))
                        .draw();
                });
            }

            for (var i = 0; i < dc.chartRegistry.list().length; i++) {
                var chartI = dc.chartRegistry.list()[i];
                chartI.on("filtered", RefreshTable);
            }
            RefreshTable();

            dc.renderAll();
        }
    }
})
