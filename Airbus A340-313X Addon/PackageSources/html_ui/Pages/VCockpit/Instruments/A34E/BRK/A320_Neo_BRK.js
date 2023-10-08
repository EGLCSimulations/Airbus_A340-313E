var A320_Neo_BRK_Definitions;
(function (A320_Neo_BRK_Definitions) {
    class Common {
    }
    Common.PIVOT_POSITION = new Vec2(60, 60);
    Common.DEFAULT_TRANSLATE_STRING = "translate(60, 60)";
    A320_Neo_BRK_Definitions.Common = Common;
    class DialFrame {
    }
    DialFrame.START = new Vec2(48, -32);
    DialFrame.END = new Vec2(-32, 48);
    DialFrame.INNER_RADIUS = 58;
    DialFrame.OUTER_RADIUS = 200;
    A320_Neo_BRK_Definitions.DialFrame = DialFrame;
    class Marker {
    }
    Marker.START_RADIUS = A320_Neo_BRK_Definitions.DialFrame.OUTER_RADIUS + 4;
    Marker.LENGTH_SHORT = 16;
    Marker.LENGTH_LONG = 36;
    A320_Neo_BRK_Definitions.Marker = Marker;
    class Indicator {
    }
    Indicator.ANGLE_MIN = 0;
    Indicator.ANGLE_MAX = 90;
    Indicator.ARROW_MAIN_LENGTH = 160;
    Indicator.ARROW_HEAD_LENGTH = 28;
    Indicator.ARROW_HALF_HEIGHT = 20;
    Indicator.CIRCLE_RADIUS = 48;
    A320_Neo_BRK_Definitions.Indicator = Indicator;
    class OuterArc {
    }
    OuterArc.RADIUS = A320_Neo_BRK_Definitions.DialFrame.OUTER_RADIUS + 20;
    A320_Neo_BRK_Definitions.OuterArc = OuterArc;
})(A320_Neo_BRK_Definitions || (A320_Neo_BRK_Definitions = {}));
var A320_Neo_BRK;
(function (A320_Neo_BRK) {
    class Display extends BaseAirliners {
        constructor() {
            super();
        }
        get templateID() { return "A320_Neo_BRK"; }
        connectedCallback() {
            super.connectedCallback();
            this.topGauge = new A320_Neo_BRK_Gauge(this.querySelector("#topGauge"), 0, 4);
            this.topGauge.addOuterArc(2.75, 3.5);
            this.topGauge.addMarker(0, true);
            this.topGauge.addMarker(4, true);
            this.leftGauge = new A320_Neo_BRK_Gauge(this.querySelector("#leftGauge"), 0, 3);
            this.leftGauge.addOuterArc(0, 1);
            this.leftGauge.addMarker(0, false);
            this.leftGauge.addMarker(0.5, false);
            this.leftGauge.addMarker(1, false);
            this.leftGauge.addMarker(1.5, true);
            this.leftGauge.addMarker(2, false);
            this.leftGauge.addMarker(2.5, true);
            this.leftGauge.addMarker(3, false);
            this.rightGauge = new A320_Neo_BRK_Gauge(this.querySelector("#rightGauge"), 0, 3);
            this.rightGauge.addOuterArc(0, 1);
            this.rightGauge.addMarker(0, false);
            this.rightGauge.addMarker(0.5, false);
            this.rightGauge.addMarker(1, false);
            this.rightGauge.addMarker(1.5, true);
            this.rightGauge.addMarker(2, false);
            this.rightGauge.addMarker(2.5, true);
            this.rightGauge.addMarker(3, false);
        }
        onUpdate(_deltaTime) {
            super.onUpdate(_deltaTime);
            if (this.topGauge != null) {
                this.topGauge.setValue(3);
            }
            if (this.leftGauge != null) {
                this.leftGauge.setValue(2);
            }
            if (this.rightGauge != null) {
                this.rightGauge.setValue(2);
            }
        }
    }
    A320_Neo_BRK.Display = Display;
    class A320_Neo_BRK_Gauge {
        constructor(_svgGroup, _min, _max) {
            this.minValue = _min;
            this.maxValue = _max;
            if (_svgGroup != null) {
                this.outerArcsGroup = document.createElementNS(Avionics.SVG.NS, "g");
                diffAndSetAttribute(this.outerArcsGroup, "class", "outerArcs");
                diffAndSetAttribute(this.outerArcsGroup, "transform", A320_Neo_BRK_Definitions.Common.DEFAULT_TRANSLATE_STRING);
                _svgGroup.appendChild(this.outerArcsGroup);
                this.markersGroup = document.createElementNS(Avionics.SVG.NS, "g");
                diffAndSetAttribute(this.markersGroup, "class", "markers");
                diffAndSetAttribute(this.markersGroup, "transform", A320_Neo_BRK_Definitions.Common.DEFAULT_TRANSLATE_STRING);
                _svgGroup.appendChild(this.markersGroup);
                var dialFrameGroup = document.createElementNS(Avionics.SVG.NS, "g");
                diffAndSetAttribute(dialFrameGroup, "class", "dialFrame");
                diffAndSetAttribute(dialFrameGroup, "transform", A320_Neo_BRK_Definitions.Common.DEFAULT_TRANSLATE_STRING);
                {
                    var dialFrameShape = document.createElementNS(Avionics.SVG.NS, "path");
                    var d = [
                        "M", A320_Neo_BRK_Definitions.DialFrame.START.x, A320_Neo_BRK_Definitions.DialFrame.START.y,
                        "L", A320_Neo_BRK_Definitions.DialFrame.OUTER_RADIUS, A320_Neo_BRK_Definitions.DialFrame.START.y,
                        "A", A320_Neo_BRK_Definitions.DialFrame.OUTER_RADIUS, A320_Neo_BRK_Definitions.DialFrame.OUTER_RADIUS, "0 0 1", A320_Neo_BRK_Definitions.DialFrame.END.x, A320_Neo_BRK_Definitions.DialFrame.OUTER_RADIUS,
                        "L", A320_Neo_BRK_Definitions.DialFrame.END.x, A320_Neo_BRK_Definitions.DialFrame.END.y,
                        "A", A320_Neo_BRK_Definitions.DialFrame.INNER_RADIUS, A320_Neo_BRK_Definitions.DialFrame.INNER_RADIUS, "0 1 1", A320_Neo_BRK_Definitions.DialFrame.START.x, A320_Neo_BRK_Definitions.DialFrame.START.y
                    ].join(" ");
                    diffAndSetAttribute(dialFrameShape, "d", d);
                    dialFrameGroup.appendChild(dialFrameShape);
                }
                _svgGroup.appendChild(dialFrameGroup);
                this.indicatorGroup = document.createElementNS(Avionics.SVG.NS, "g");
                diffAndSetAttribute(this.indicatorGroup, "class", "indicator");
                {
                    var indicatorArrow = document.createElementNS(Avionics.SVG.NS, "path");
                    diffAndSetAttribute(indicatorArrow, "class", "indicatorArrow");
                    var d = [
                        "M 0", -A320_Neo_BRK_Definitions.Indicator.ARROW_HALF_HEIGHT,
                        "L", A320_Neo_BRK_Definitions.Indicator.ARROW_MAIN_LENGTH, -A320_Neo_BRK_Definitions.Indicator.ARROW_HALF_HEIGHT,
                        "L", (A320_Neo_BRK_Definitions.Indicator.ARROW_MAIN_LENGTH + A320_Neo_BRK_Definitions.Indicator.ARROW_HEAD_LENGTH), "0",
                        "L", A320_Neo_BRK_Definitions.Indicator.ARROW_MAIN_LENGTH, A320_Neo_BRK_Definitions.Indicator.ARROW_HALF_HEIGHT,
                        "L 0", A320_Neo_BRK_Definitions.Indicator.ARROW_HALF_HEIGHT
                    ].join(" ");
                    diffAndSetAttribute(indicatorArrow, "d", d);
                    this.indicatorGroup.appendChild(indicatorArrow);
                }
                {
                    var indicatorCircle = document.createElementNS(Avionics.SVG.NS, "circle");
                    diffAndSetAttribute(indicatorCircle, "class", "indicatorCircle");
                    diffAndSetAttribute(indicatorCircle, "r", A320_Neo_BRK_Definitions.Indicator.CIRCLE_RADIUS + '');
                    diffAndSetAttribute(indicatorCircle, "cx", "0");
                    diffAndSetAttribute(indicatorCircle, "cy", "0");
                    this.indicatorGroup.appendChild(indicatorCircle);
                }
                _svgGroup.appendChild(this.indicatorGroup);
            }
            this.setValue(this.minValue, true);
        }
        addMarker(_value, _isShort) {
            if (this.markersGroup != null) {
                var dir = this.valueToDir(_value);
                var start = new Vec2(0, 0);
                start.x += dir.x * A320_Neo_BRK_Definitions.Marker.START_RADIUS;
                start.y += dir.y * A320_Neo_BRK_Definitions.Marker.START_RADIUS;
                var end = new Vec2(start.x, start.y);
                if (_isShort) {
                    end.x += dir.x * A320_Neo_BRK_Definitions.Marker.LENGTH_SHORT;
                    end.y += dir.y * A320_Neo_BRK_Definitions.Marker.LENGTH_SHORT;
                }
                else {
                    end.x += dir.x * A320_Neo_BRK_Definitions.Marker.LENGTH_LONG;
                    end.y += dir.y * A320_Neo_BRK_Definitions.Marker.LENGTH_LONG;
                }
                var line = document.createElementNS(Avionics.SVG.NS, "line");
                diffAndSetAttribute(line, "class", "marker");
                diffAndSetAttribute(line, "x1", start.x + '');
                diffAndSetAttribute(line, "y1", start.y + '');
                diffAndSetAttribute(line, "x2", end.x + '');
                diffAndSetAttribute(line, "y2", end.y + '');
                this.markersGroup.appendChild(line);
            }
        }
        addOuterArc(_startValue, _endValue) {
            if (this.outerArcsGroup != null) {
                _startValue = Utils.Clamp(_startValue, this.minValue, this.maxValue);
                _endValue = Utils.Clamp(_endValue, this.minValue, this.maxValue);
                if (_startValue != _endValue) {
                    var arc = document.createElementNS(Avionics.SVG.NS, "path");
                    diffAndSetAttribute(arc, "class", "outerArc");
                    var d = "";
                    var startAngle = this.valueToAngle(_startValue, true);
                    var startX = (Math.cos(startAngle) * A320_Neo_BRK_Definitions.OuterArc.RADIUS);
                    var startY = (Math.sin(startAngle) * A320_Neo_BRK_Definitions.OuterArc.RADIUS);
                    var endAngle = this.valueToAngle(_endValue, true);
                    var endX = (Math.cos(endAngle) * A320_Neo_BRK_Definitions.OuterArc.RADIUS);
                    var endY = (Math.sin(endAngle) * A320_Neo_BRK_Definitions.OuterArc.RADIUS);
                    var largeArcFlag = ((endAngle - startAngle) <= Math.PI) ? "0 0 0" : "0 1 0";
                    d = [
                        "M", endX, endY,
                        "A", A320_Neo_BRK_Definitions.OuterArc.RADIUS, A320_Neo_BRK_Definitions.OuterArc.RADIUS, largeArcFlag, startX, startY
                    ].join(" ");
                    diffAndSetAttribute(arc, "d", d);
                    this.outerArcsGroup.appendChild(arc);
                }
            }
        }
        valueToAngle(_value, _radians) {
            var percentage = (_value - this.minValue) / (this.maxValue - this.minValue);
            var angle = (A320_Neo_BRK_Definitions.Indicator.ANGLE_MIN + ((A320_Neo_BRK_Definitions.Indicator.ANGLE_MAX - A320_Neo_BRK_Definitions.Indicator.ANGLE_MIN) * percentage));
            if (_radians) {
                angle *= (Math.PI / 180.0);
            }
            return angle;
        }
        valueToDir(_value) {
            var angle = this.valueToAngle(_value, true);
            return (new Vec2(Math.cos(angle), Math.sin(angle)));
        }
        setValue(_value, _force = false) {
            if ((_value != this.currentValue) || _force) {
                this.currentValue = Utils.Clamp(_value, this.minValue, this.maxValue);
                if (this.indicatorGroup != null) {
                    diffAndSetAttribute(this.indicatorGroup, "transform", A320_Neo_BRK_Definitions.Common.DEFAULT_TRANSLATE_STRING + " rotate(" + this.valueToAngle(this.currentValue, false) + ")");
                }
            }
        }
    }
})(A320_Neo_BRK || (A320_Neo_BRK = {}));
registerInstrument("a320-neo-brk", A320_Neo_BRK.Display);
//# sourceMappingURL=A320_Neo_BRK.js.map