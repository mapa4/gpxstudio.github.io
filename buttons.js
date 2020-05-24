import Slider from './slider.js';
import TileCover from './include/mapbox/tilecover.js';

export default class Buttons {
    constructor() {
        var _this = this;

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                _this.mapbox_token = xhr.responseText;
            }
        }
        xhr.open('GET', './mapbox_token.txt');
        xhr.send();

        var xhr2 = new XMLHttpRequest();
        xhr2.onreadystatechange = function() {
            if (xhr2.readyState == 4 && xhr2.status == 200) {
                _this.airmap_token = xhr2.responseText;
            }
        }
        xhr2.open('GET', './airmap_token.txt');
        xhr2.send();

        // MAIN MAP
        this.map = L.map('mapid', {
            zoomControl: false
        }).setView([50.772, 3.890], 13);
        this.map.addEventListener("locationfound", function (e) {
            e.target.fitBounds(e.bounds);
        });
        this.map.locate();

        // TILES
        /*L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: this.mapbox_token
        }).addTo(map);*/

        L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        	maxZoom: 18,
        	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // ZOOM CONTROL
        this.zoom = L.control.zoom({
            position: 'topright'
        }).addTo(this.map);

        // ELEVATION PROFILE
        this.elev = L.control.elevation({
            theme: "steelblue-theme",
            useHeightIndicator: true,
            width: 400,
        	height: 100,
            margins:{
                top:20,
                right:30,
                bottom:18,
                left:40
            }
        }).addTo(this.map);
        this.elev.buttons = this;

        // ELEVATION UTILITIES
        this.tilecover = new TileCover();

        // BUTTONS
        this.input = document.getElementById("input-file");
        this.load = document.getElementById("load");
        this.draw = document.getElementById("manual");
        this.clear = document.getElementById("clear");
        this.donate = document.getElementById("donate");
        this.delete = document.getElementById("delete");
        this.reverse = document.getElementById("reverse");
        this.time = document.getElementById("edit-time");
        this.edit = document.getElementById("edit");
        this.validate = document.getElementById("validate");
        this.unvalidate = document.getElementById("unvalidate");
        this.export = document.getElementById("export");
        this.units = document.getElementById("units");
        this.activity = document.getElementById("activity");
        this.method = document.getElementById("method");
        this.bike = document.getElementById("bike");
        this.run = document.getElementById("run");
        this.kms = document.getElementById("km");
        this.mi = document.getElementById("mi");
        this.route = document.getElementById("route");
        this.crow = document.getElementById("crow");

        // DISPLAYS
        this.distance = document.getElementById("distance-val");
        this.elevation = document.getElementById("elevation-val");
        this.duration = document.getElementById("duration-val");
        this.speed = document.getElementById("speed-val");
        this.elevation_profile = document.getElementsByClassName('elevation')[0];
        this.trace_info_grid = document.getElementById('info-grid');
        this.start_slider = document.getElementById('start-point');
        this.end_slider = document.getElementById('end-point');
        this.total_tab = document.getElementById('total-tab');
        this.tabs = document.getElementById('sortable');

        // OVERLAY COMPONENTS
        this.toolbar = L.control({position: 'topleft'});
        this.toolbar.onAdd = function (map) {
            var div = document.getElementById('toolbar');
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        this.toolbar.addTo(this.map);

        this.trace_info = L.control({position: 'bottomleft'});
        this.trace_info.onAdd = function (map) {
            var div = document.getElementById('info');
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        this.trace_info.addTo(this.map);
        this.trace_info_grid.appendChild(this.elevation_profile);

        this.slider = new Slider(this);

        this.addHandlers();

        // SETTINGS
        this.km = true;
        this.cycling = true;
        this.routing = true;
    }

    hideTraceButtons() {
        this.slider.hide();
        this.delete.style.visibility = 'hidden';
        //this.reverse.style.visibility = 'hidden';
        this.edit.style.visibility = 'hidden';
        this.time.style.visibility = 'hidden';
    }

    showTraceButtons() {
        this.slider.show();
        this.delete.style.visibility = 'visible';
        //this.reverse.style.visibility = 'visible';
        this.edit.style.visibility = 'visible';
        this.time.style.visibility = 'visible';
    }

    hideToolbars() {
        this.toolbar.getContainer().style.visibility = 'hidden';
        this.trace_info.getContainer().style.visibility = 'hidden';
        this.hideTraceButtons();
    }

    showToolbars() {
        this.toolbar.getContainer().style.visibility = 'visible';
        this.trace_info.getContainer().style.visibility = 'visible';
        this.showTraceButtons();
    }

    disableMap() {
        this.map.dragging.disable();
        this.map.touchZoom.disable();
        this.map.doubleClickZoom.disable();
        this.map.scrollWheelZoom.disable();
        this.map.boxZoom.disable();
        this.map.keyboard.disable();
        this.zoom.disable();
        if (this.map.tap) this.map.tap.disable();
    }

    enableMap() {
        this.map.dragging.enable();
        this.map.touchZoom.enable();
        this.map.doubleClickZoom.enable();
        this.map.scrollWheelZoom.enable();
        this.map.boxZoom.enable();
        this.map.keyboard.enable();
        this.zoom.enable();
        if (this.map.tap) this.map.tap.enable();
    }

    editToValidate() {
        this.edit.childNodes[0].classList.remove('fa-pencil-alt');
        this.edit.childNodes[0].classList.add('fa-check');
        this.showValidate();
    }

    validateToEdit() {
        this.edit.childNodes[0].classList.remove('fa-check');
        this.edit.childNodes[0].classList.add('fa-pencil-alt');
    }

    showValidate() {
        this.edit.style.visibility = 'visible';
    }

    hideValidate() {
        this.edit.style.visibility = 'hidden';
    }

    circlesToFront() {
        if (this.elev._startCircle) {
            this.elev._startCircle.bringToFront();
            this.elev._endCircle.bringToFront();
        }
    }

    addHandlers() {
        const buttons = this;
        this.input.oninput = function() {
            buttons.loadFiles(this.files)
        };
        this.load.addEventListener("click", function () {
            buttons.input.click();
        });
        this.donate.addEventListener("click", function () {
            buttons.donation();
        });
        this.unvalidate.addEventListener("click", function () {
            buttons.slider.reset();
        });
    }

    addHandlersWithTotal(total) {
        this.total = total;
        this.elev.total = total;
        const buttons = this;
        const map = this.map;

        $( ".sortable" ).on( "sortupdate", function( event, ui ) {
            const order = total.buttons.tabs.childNodes;
            const offset = 3;

            for (var i=offset; i<order.length; i++)
                total.swapTraces(i-offset, order[i].trace.index);

            if (total.hasFocus) total.update();
        });

        this.draw.addEventListener("click", function () {
            const newTrace = total.addTrace(undefined, "new.gpx");
            newTrace.draw();
        });
        this.clear.addEventListener("click", function () {
            total.clear();
        });
        this.delete.addEventListener("click", function () {
            if (total.hasFocus) return;
            total.removeTrace(total.focusOn);
        });
        this.export.addEventListener("click", function () {
            if (total.traces.length > 0) buttons.download('track.gpx', total.outputGPX());
        });
        this.validate.addEventListener("click", function () {
            if (total.hasFocus) return;
            total.traces[total.focusOn].crop(total.buttons.slider.getIndexStart(), total.buttons.slider.getIndexEnd());
        });
        buttons.kms.classList.add("selected");
        this.units.addEventListener("click", function () {
            buttons.km = !buttons.km;
            if (buttons.km) {
                buttons.kms.classList.add("selected");
                buttons.mi.classList.remove("selected");
            } else {
                buttons.kms.classList.remove("selected");
                buttons.mi.classList.add("selected");
            }
            if (total.hasFocus) total.showData();
            else total.traces[total.focusOn].showData();
        });
        buttons.bike.classList.add("selected");
        this.activity.addEventListener("click", function () {
            buttons.cycling = !buttons.cycling;
            if (buttons.cycling) {
                buttons.bike.classList.add("selected");
                buttons.run.classList.remove("selected");
            } else {
                buttons.bike.classList.remove("selected");
                buttons.run.classList.add("selected");
            }
            if (total.hasFocus) total.showData();
            else total.traces[total.focusOn].showData();
        });
        buttons.route.classList.add("selected");
        this.method.addEventListener("click", function () {
            buttons.routing = !buttons.routing;
            if (buttons.routing) {
                buttons.route.classList.add("selected");
                buttons.crow.classList.remove("selected");
            } else {
                buttons.route.classList.remove("selected");
                buttons.crow.classList.add("selected");
            }
            if (total.hasFocus) total.showData();
            else total.traces[total.focusOn].showData();
        });
        this.map.addEventListener("zoomend", function () {
            if (total.hasFocus) return;
            const trace = total.traces[total.focusOn];
            if (trace.isEdited) trace.updateEditMarkers();
        });
        this.edit.addEventListener("click", function() {
            if (total.hasFocus) return;
            var trace = total.traces[total.focusOn];
            if (trace.isEdited) {
                trace.stopEdit();
                if (trace.drawing) trace.stopDraw();
            } else trace.edit();
        });
        map.on('mouseup', function (e) {
            map.dragging.enable();
            map.removeEventListener('mousemove');
            if (map._draggedMarker) {
                if (total.hasFocus) return;
                var trace = total.traces[total.focusOn];
                const marker = map._draggedMarker;
                marker.getElement().style.cursor = 'pointer';
                trace.updatePoint(marker, e.latlng.lat, e.latlng.lng);
                trace.refreshEditMarkers();
                map._draggedMarker = null;
            }
        });
        this.time.addEventListener("click", function (e) {
            const trace = total.traces[total.focusOn];
            if (trace.popup) return;

            var content = `<div id="popup-grid">
                           <div id="speed-change">`;

            if (buttons.cycling) {
                content += `Speed <input type="number" id="speed" min="1.0" max="99.9" step="0.1" lang="en-150"> `;
                if (buttons.km) content += `km/h</div>`;
                else content += `mi/h</div>`;
            } else {
                content += `Pace <input type="number" id="minutes" min="1" max="59" step="1">
                            :
                            <input type="number" id="seconds" min="0" max="59" step="1"> `;
                if (buttons.km) content += `min/km</div>`;
                else content += `min/mi</div>`;
            }

            content += `<div id="start-change">Start
                        <input type="datetime-local" id="start-time"></div>
                        <div id="ok-dialog"><i class="fas fa-check custom-button"></i></div>
                        <div id="close-dialog"><i class="fas fa-times custom-button"></i></div>
                        </div>`;

            const popup = L.popup({
                closeButton: false,
                autoPan: false,
                className: "custom-popup"
            });

            popup.setContent(content);
            popup.setLatLng(map.getCenter());
            popup.openOn(map);
            popup.update();
            popup.addEventListener('remove', function (e) {
                trace.closePopup();
                buttons.enableMap();
            });
            trace.popup = popup;
            buttons.disableMap();

            var offset = -(new Date().getTimezoneOffset() / 60);

            var speed = document.getElementById("speed");
            var minutes = document.getElementById("minutes");
            var seconds = document.getElementById("seconds");

            if (buttons.cycling) {
                speed.value = trace.getMovingSpeed().toFixed(1);
            } else {
                var pace = Math.floor(trace.getMovingPace() / 1000);
                minutes.value = Math.floor(pace / 60);
                seconds.value = pace % 60;
            }

            var start = document.getElementById("start-time");
            if (trace.hasPoints()) {
                const points = trace.getPoints();
                if (points[0].meta.time) start.value = (new Date(points[0].meta.time.getTime() + offset * 60 * 60 * 1000)).toISOString().substring(0, 16);
            }

            var ok = document.getElementById("ok-dialog");
            ok.addEventListener("click", function () {
                // others: pay attention to units
                var v = 0;
                if (buttons.cycling) {
                    v = Number(speed.value);
                    if (!buttons.km) v *= 1.60934;
                } else {
                    v = Number(minutes.value) * 60 +  Number(seconds.value);
                    v = Math.max(v, 1);
                    if (!buttons.km) v /= 1.60934;
                    v = 1 / v; // km/s
                    v *= 3600;
                }

                const startTime = new Date(new Date(start.value).getTime());

                trace.closePopup();
                trace.changeTimeData(startTime, v);

                trace.recomputeStats();
                trace.update();
            });

            var close = document.getElementById("close-dialog");
            close.addEventListener("click", function () {
                trace.closePopup();
            });
        });
    }

    focusTabElement(tab) {
        document.querySelectorAll('.tab').forEach(item => {item.classList.remove('tab-focus');});
        tab.classList.add('tab-focus');
    }

    updateBounds() {
        this.map.fitBounds(this.total.getBounds());
    }

    updateTabWidth() {
        const offset = 3;
        const remaining_width = Math.floor(this.trace_info_grid.offsetWidth) - Math.ceil(this.total_tab.offsetWidth);
        var tabs_width = 0;
        for (var i=offset; i<this.tabs.childNodes.length; i++) {
            this.tabs.childNodes[i].style.width = 'auto';
            tabs_width += this.tabs.childNodes[i].offsetWidth;
        }
        if (tabs_width > remaining_width) {
            const avg_tab_width = remaining_width / (this.tabs.childNodes.length - offset);
            var cnt = 0;
            var to_divide = remaining_width;
            for (var i=offset; i<this.tabs.childNodes.length; i++) {
                if (this.tabs.childNodes[i].offsetWidth >= avg_tab_width) cnt++;
                else to_divide -= this.tabs.childNodes[i].offsetWidth;
            }
            const padding = 2 * parseFloat(window.getComputedStyle(this.total_tab, null).getPropertyValue('padding-left'));
            const new_tab_width = Math.floor(to_divide / cnt - padding);
            var first = true;
            for (var i=offset; i<this.tabs.childNodes.length; i++) {
                if (this.tabs.childNodes[i].offsetWidth >= avg_tab_width) {
                    if (first) {
                        first = false;
                        this.tabs.childNodes[i].style.width = (to_divide - (cnt - 1) * (new_tab_width + padding) - padding - 1) + 'px';
                    } else this.tabs.childNodes[i].style.width = new_tab_width + 'px';
                }
            }
        }
    }

    loadFiles(files) {
        var total = this.total;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = (function(f, name) {
                return function(e) {
                    total.addTrace(e.target.result, name)
                };
            })(file, file.name);
            reader.readAsDataURL(file);
        }
        this.input.value = "";
    }

    donation() {
        window.open('https://paypal.me/vcoppe');
    }

    download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
}
