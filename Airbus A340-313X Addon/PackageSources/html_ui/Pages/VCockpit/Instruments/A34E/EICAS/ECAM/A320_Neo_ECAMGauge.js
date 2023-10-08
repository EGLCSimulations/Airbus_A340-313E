var A320_Neo_ECAM_Common;
(function (A320_Neo_ECAM_Common) {
    function isEngineDisplayActive(_index) {
        return ((SimVar.GetSimVarValue("ENG N1 RPM:" + _index, "percent") >= 0.05) || (SimVar.GetSimVarValue("ENG N2 RPM:" + _index, "percent") >= 0.05));
    }
    A320_Neo_ECAM_Common.isEngineDisplayActive = isEngineDisplayActive;
    class GaugeDefinition {
        constructor() {
            this.startAngle = -225;
            this.arcSize = 180;
            this.minValue = 0;
            this.maxValue = 100;
            this.minRedValue = 0;
            this.maxRedValue = 0;
            this.warningRange = [0, 0];
            this.dangerRange = [0, 0];
            this.cursorLength = 1.0;
            this.currentValuePos = new Vec2(0.65, 0.65);
            this.currentValueFunction = null;
            this.currentValuePrecision = 0;
            this.currentValueBorderWidth = 0;
            this.outerIndicatorFunction = null;
            this.outerDynamicArcFunction = null;
            this.extraMessageFunction = null;
        }
    }
    A320_Neo_ECAM_Common.GaugeDefinition = GaugeDefinition;
    class Gauge extends HTMLElement {
        constructor() {
            super(...arguments);
            this.viewBoxSize = new Vec2(100, 100);
            this.startAngle = -225;
            this.warningRange = [0, 0];
            this.dangerRange = [0, 0];
            this.outerDynamicArcCurrentValues = [0, 0];
            this.outerDynamicArcTargetValues = [0, 0];
            this.extraMessageString = "";
            this.isActive = true;
        }
        get mainArcRadius() {
            return (this.viewBoxSize.x * 0.5 * 0.975);
        }
        get graduationInnerLineEndOffset() {
            return (this.mainArcRadius * 0.875);
        }
        get graduationOuterLineEndOffset() {
            return (this.mainArcRadius * 1.175);
        }
        get graduationTextOffset() {
            return (this.mainArcRadius * 0.625);
        }
        get redArcInnerRadius() {
            return (this.mainArcRadius * 0.95);
        }
        get outerIndicatorOffset() {
            return (this.viewBoxSize.x * 0.04);
        }
        get outerIndicatorRadius() {
            return (this.viewBoxSize.x * 0.035);
        }
        get outerDynamicArcRadius() {
            return (this.mainArcRadius * 1.15);
        }
        get currentValueBorderHeight() {
            return (this.viewBoxSize.y * 0.25);
        }
        get extraMessagePosX() {
            return (this.center.x + (this.viewBoxSize.x * 0.025));
        }
        get extraMessagePosY() {
            return (this.center.y - (this.viewBoxSize.y * 0.025));
        }
        get extraMessageBorderPosX() {
            return (this.extraMessagePosX - (this.viewBoxSize.x * 0.2));
        }
        get extraMessageBorderPosY() {
            return (this.extraMessagePosY - (this.viewBoxSize.y * 0.09));
        }
        get extraMessageBorderWidth() {
            return (this.viewBoxSize.x * 0.4);
        }
        get extraMessageBorderHeight() {
            return (this.viewBoxSize.y * 0.20);
        }
        set active(_isActive) {
            if (this.isActive != _isActive) {
                this.isActive = _isActive;
                this.refreshActiveState();
            }
        }
        get active() {
            return this.isActive;
        }
        polarToCartesian(_centerX, _centerY, _radius, _angleInDegrees) {
            var angleInRadians = _angleInDegrees * (Math.PI / 180.0);
            return new Vec2(_centerX + (_radius * Math.cos(angleInRadians)), _centerY + (_radius * Math.sin(angleInRadians)));
        }
        valueToAngle(_value, _radians) {
            var valuePercentage = (_value - this.minValue) / (this.maxValue - this.minValue);
            var angle = (this.startAngle + (valuePercentage * this.arcSize));
            if (_radians) {
                angle *= (Math.PI / 180.0);
            }
            return angle;
        }
        valueToDir(_value) {
            var angle = this.valueToAngle(_value, true);
            return (new Vec2(Math.cos(angle), Math.sin(angle)));
        }
        init(_gaugeDefinition) {
            this.startAngle = _gaugeDefinition.startAngle;
            this.arcSize = _gaugeDefinition.arcSize;
            this.minValue = _gaugeDefinition.minValue;
            this.maxValue = _gaugeDefinition.maxValue;
            this.minRedValue = _gaugeDefinition.minRedValue;
            this.maxRedValue = _gaugeDefinition.maxRedValue;
            this.warningRange[0] = _gaugeDefinition.warningRange[0];
            this.warningRange[1] = _gaugeDefinition.warningRange[1];
            this.dangerRange[0] = _gaugeDefinition.dangerRange[0];
            this.dangerRange[1] = _gaugeDefinition.dangerRange[1];
            this.currentValueFunction = _gaugeDefinition.currentValueFunction;
            this.currentValuePrecision = _gaugeDefinition.currentValuePrecision;
            this.outerIndicatorFunction = _gaugeDefinition.outerIndicatorFunction;
            this.outerDynamicArcFunction = _gaugeDefinition.outerDynamicArcFunction;
            this.extraMessageFunction = _gaugeDefinition.extraMessageFunction;
            this.endAngle = this.startAngle + _gaugeDefinition.arcSize;
            this.center = new Vec2(this.viewBoxSize.x * 0.5, this.viewBoxSize.y * 0.5);
            this.rootSVG = document.createElementNS(Avionics.SVG.NS, "svg");
            this.rootSVG.id = "RootSVG";
            diffAndSetAttribute(this.rootSVG, "viewBox", "0 0 " + this.viewBoxSize.x + " " + this.viewBoxSize.y);
            this.appendChild(this.rootSVG);
            this.mainArc = document.createElementNS(Avionics.SVG.NS, "path");
            this.mainArc.id = "MainArc";
            {
                var startPos = this.polarToCartesian(this.center.x, this.center.y, this.mainArcRadius, this.endAngle);
                var endPos = this.polarToCartesian(this.center.x, this.center.y, this.mainArcRadius, this.startAngle);
                var largeArcFlag = ((this.endAngle - this.startAngle) <= 180) ? "0" : "1";
                var d = ["M", startPos.x, startPos.y, "A", this.mainArcRadius, this.mainArcRadius, 0, largeArcFlag, 0, endPos.x, endPos.y].join(" ");
                diffAndSetAttribute(this.mainArc, "d", d);
            }
            this.rootSVG.appendChild(this.mainArc);
            if (this.minRedValue != this.maxRedValue) {
                var minRedDir = this.valueToDir(this.minRedValue);
                var maxRedDir = this.valueToDir(this.maxRedValue);
                var topRight = new Vec2(this.center.x + (maxRedDir.x * this.mainArcRadius), this.center.y + (maxRedDir.y * this.mainArcRadius));
                var topLeft = new Vec2(this.center.x + (minRedDir.x * this.mainArcRadius), this.center.y + (minRedDir.y * this.mainArcRadius));
                var bottomRight = new Vec2(this.center.x + (maxRedDir.x * this.redArcInnerRadius), this.center.y + (maxRedDir.y * this.redArcInnerRadius));
                var bottomLeft = new Vec2(this.center.x + (minRedDir.x * this.redArcInnerRadius), this.center.y + (minRedDir.y * this.redArcInnerRadius));
                var d = [
                    "M", topRight.x, topRight.y,
                    "A", this.mainArcRadius, this.mainArcRadius, 0, "0", 0, topLeft.x, topLeft.y,
                    "L", bottomLeft.x, bottomLeft.y,
                    "M", topRight.x, topRight.y,
                    "L", bottomRight.x, bottomRight.y,
                    "A", this.redArcInnerRadius, this.redArcInnerRadius, 0, "0", 0, bottomLeft.x, bottomLeft.y
                ].join(" ");
                this.redArc = document.createElementNS(Avionics.SVG.NS, "path");
                this.redArc.id = "RedArc";
                diffAndSetAttribute(this.redArc, "d", d);
                this.rootSVG.appendChild(this.redArc);
            }
            this.graduationsGroup = document.createElementNS(Avionics.SVG.NS, "g");
            this.graduationsGroup.id = "GraduationsGroup";
            this.rootSVG.appendChild(this.graduationsGroup);
            var cursorGroup = document.createElementNS(Avionics.SVG.NS, "g");
            cursorGroup.id = "CursorGroup";
            this.cursor = document.createElementNS(Avionics.SVG.NS, "line");
            diffAndSetAttribute(this.cursor, "x1", (this.mainArcRadius * (1 - _gaugeDefinition.cursorLength)) + '');
            diffAndSetAttribute(this.cursor, "y1", "0");
            diffAndSetAttribute(this.cursor, "x2", this.mainArcRadius + '');
            diffAndSetAttribute(this.cursor, "y2", "0");
            diffAndSetAttribute(cursorGroup, "transform", "translate(" + this.center.x + ", " + this.center.y + ")");
            cursorGroup.appendChild(this.cursor);
            if (this.outerDynamicArcFunction != null) {
                this.outerDynamicArcObject = document.createElementNS(Avionics.SVG.NS, "path");
                this.outerDynamicArcObject.id = "OuterDynamicArcObject";
                this.rootSVG.appendChild(this.outerDynamicArcObject);
            }
            if (this.outerIndicatorFunction != null) {
                this.outerIndicatorObject = document.createElementNS(Avionics.SVG.NS, "path");
                var radius = this.outerIndicatorRadius;
                var d = [
                    "M", (this.mainArcRadius + this.outerIndicatorOffset), "0",
                    "a", radius, radius, "0 1 0", (radius * 2), "0",
                    "a", radius, radius, "0 1 0", -(radius * 2), "0"
                ].join(" ");
                diffAndSetAttribute(this.outerIndicatorObject, "d", d);
                cursorGroup.appendChild(this.outerIndicatorObject);
            }
            this.rootSVG.appendChild(cursorGroup);
            var textPosX = this.viewBoxSize.x * _gaugeDefinition.currentValuePos.x;
            var textPosY = this.viewBoxSize.x * _gaugeDefinition.currentValuePos.y;
            this.currentValueText = document.createElementNS(Avionics.SVG.NS, "text");
            this.currentValueText.id = "CurrentValue";
            diffAndSetAttribute(this.currentValueText, "x", textPosX + '');
            diffAndSetAttribute(this.currentValueText, "y", textPosY + '');
            diffAndSetAttribute(this.currentValueText, "alignment-baseline", "central");
            this.rootSVG.appendChild(this.currentValueText);
            if (_gaugeDefinition.currentValueBorderWidth > 0) {
                var borderWidth = this.viewBoxSize.x * _gaugeDefinition.currentValueBorderWidth;
                var borderHeight = this.currentValueBorderHeight;
                var borderPosX = textPosX - (borderWidth * 0.95);
                var borderPosY = textPosY - (borderHeight * 0.5);
                var currentValueBorder = document.createElementNS(Avionics.SVG.NS, "rect");
                currentValueBorder.id = "CurrentValueBorder";
                diffAndSetAttribute(currentValueBorder, "x", borderPosX + '');
                diffAndSetAttribute(currentValueBorder, "y", borderPosY + '');
                diffAndSetAttribute(currentValueBorder, "width", borderWidth + '');
                diffAndSetAttribute(currentValueBorder, "height", borderHeight + '');
                this.rootSVG.appendChild(currentValueBorder);
            }
            if (this.extraMessageFunction != null) {
                var extraMessageGroup = document.createElementNS(Avionics.SVG.NS, "g");
                extraMessageGroup.id = "ExtraMessage";
                this.extraMessageBorder = document.createElementNS(Avionics.SVG.NS, "rect");
                diffAndSetAttribute(this.extraMessageBorder, "x", this.extraMessageBorderPosX + '');
                diffAndSetAttribute(this.extraMessageBorder, "y", this.extraMessageBorderPosY + '');
                diffAndSetAttribute(this.extraMessageBorder, "width", this.extraMessageBorderWidth + '');
                diffAndSetAttribute(this.extraMessageBorder, "height", this.extraMessageBorderHeight + '');
                diffAndSetAttribute(this.extraMessageBorder, "class", "inactive");
                extraMessageGroup.appendChild(this.extraMessageBorder);
                this.extraMessageText = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(this.extraMessageText, "x", this.extraMessagePosX + '');
                diffAndSetAttribute(this.extraMessageText, "y", this.extraMessagePosY + '');
                diffAndSetAttribute(this.extraMessageText, "alignment-baseline", "central");
                diffAndSetAttribute(this.extraMessageText, "class", "inactive");
                extraMessageGroup.appendChild(this.extraMessageText);
                this.rootSVG.appendChild(extraMessageGroup);
            }
            this.refreshMainValue(this.minValue, true);
            if (this.outerIndicatorFunction != null) {
                this.refreshOuterIndicator(0, true);
            }
            if (this.outerDynamicArcFunction != null) {
                this.refreshOuterDynamicArc(0, 0);
            }
            this.refreshActiveState();
        }
        addGraduation(_value, _showInnerMarker, _text = "", _showOuterMarker = false) {
            var dir = this.valueToDir(_value);
            if (_showInnerMarker) {
                var start = new Vec2(this.center.x + (dir.x * this.mainArcRadius), this.center.y + (dir.y * this.mainArcRadius));
                var end = new Vec2(this.center.x + (dir.x * this.graduationInnerLineEndOffset), this.center.y + (dir.y * this.graduationInnerLineEndOffset));
                var marker = document.createElementNS(Avionics.SVG.NS, "line");
                diffAndSetAttribute(marker, "class", "InnerMarker");
                diffAndSetAttribute(marker, "x1", start.x + '');
                diffAndSetAttribute(marker, "y1", start.y + '');
                diffAndSetAttribute(marker, "x2", end.x + '');
                diffAndSetAttribute(marker, "y2", end.y + '');
                this.graduationsGroup.appendChild(marker);
            }
            if (_showOuterMarker) {
                var start = new Vec2(this.center.x + (dir.x * this.mainArcRadius), this.center.y + (dir.y * this.mainArcRadius));
                var end = new Vec2(this.center.x + (dir.x * this.graduationOuterLineEndOffset), this.center.y + (dir.y * this.graduationOuterLineEndOffset));
                var marker = document.createElementNS(Avionics.SVG.NS, "line");
                diffAndSetAttribute(marker, "class", "OuterMarker");
                diffAndSetAttribute(marker, "x1", start.x + '');
                diffAndSetAttribute(marker, "y1", start.y + '');
                diffAndSetAttribute(marker, "x2", end.x + '');
                diffAndSetAttribute(marker, "y2", end.y + '');
                this.graduationsGroup.appendChild(marker);
            }
            if (_text.length > 0) {
                var pos = new Vec2(this.center.x + (dir.x * this.graduationTextOffset), this.center.y + (dir.y * this.graduationTextOffset));
                var text = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetText(text, _text);
                diffAndSetAttribute(text, "x", pos.x + '');
                diffAndSetAttribute(text, "y", pos.y + '');
                diffAndSetAttribute(text, "alignment-baseline", "central");
                this.graduationsGroup.appendChild(text);
            }
        }
        refreshActiveState() {
            var style = this.isActive ? "active" : "inactive";
            if (this.mainArc != null) {
                diffAndSetAttribute(this.mainArc, "class", style);
            }
            if (this.redArc != null) {
                diffAndSetAttribute(this.redArc, "class", style);
            }
            if (this.graduationsGroup != null) {
                diffAndSetAttribute(this.graduationsGroup, "class", style);
            }
            if (this.cursor != null) {
                diffAndSetAttribute(this.cursor, "class", style);
            }
            if (this.outerIndicatorObject != null) {
                diffAndSetAttribute(this.outerIndicatorObject, "class", style);
            }
            if (this.outerDynamicArcObject != null) {
                diffAndSetAttribute(this.outerDynamicArcObject, "class", style);
            }
            if (this.currentValueText != null) {
                diffAndSetAttribute(this.currentValueText, "class", style);
                if (!this.isActive) {
                    diffAndSetText(this.currentValueText, "XX");
                }
            }
        }
        update(_deltaTime) {
            if (this.isActive) {
                if (this.currentValueFunction != null) {
                    this.refreshMainValue(this.currentValueFunction());
                }
                if (this.outerIndicatorFunction != null) {
                    this.refreshOuterIndicator(this.outerIndicatorFunction() * 0.01);
                }
                if (this.outerDynamicArcFunction != null) {
                    this.outerDynamicArcFunction(this.outerDynamicArcTargetValues);
                    this.refreshOuterDynamicArc(this.outerDynamicArcTargetValues[0], this.outerDynamicArcTargetValues[1]);
                }
            }
            if ((this.extraMessageFunction != null) && (this.extraMessageText != null) && (this.extraMessageBorder != null)) {
                var extraMessage = this.isActive ? this.extraMessageFunction() + '' : "";
                if (extraMessage != this.extraMessageString) {
                    this.extraMessageString = extraMessage;
                    var style = (this.extraMessageString.length > 0) ? "active" : "inactive";
                    diffAndSetText(this.extraMessageText, this.extraMessageString);
                    diffAndSetAttribute(this.extraMessageText, "class", style);
                    diffAndSetAttribute(this.extraMessageBorder, "class", style);
                }
            }
        }
        refreshMainValue(_value, _force = false) {
            if ((_value != this.currentValue) || _force) {
                this.currentValue = _value;
                var clampedValue = Utils.Clamp(this.currentValue, this.minValue, this.maxValue);
                var style = "";
                if ((this.dangerRange[0] != this.dangerRange[1]) && (clampedValue >= this.dangerRange[0]) && (clampedValue <= this.dangerRange[1])) {
                    style = "danger";
                }
                else if ((this.warningRange[0] != this.warningRange[1]) && (clampedValue >= this.warningRange[0]) && (clampedValue <= this.warningRange[1])) {
                    style = "warning";
                }
                else {
                    style = "active";
                }
                if (this.cursor != null) {
                    var angle = this.valueToAngle(clampedValue, false);
                    diffAndSetAttribute(this.cursor, "transform", "rotate(" + angle + ")");
                    diffAndSetAttribute(this.cursor, "class", style);
                }
                if (this.currentValueText != null) {
                    var strValue = fastToFixed(this.currentValue, this.currentValuePrecision);
                    diffAndSetText(this.currentValueText, strValue);
                    diffAndSetAttribute(this.currentValueText, "class", style);
                }
            }
        }
        refreshOuterIndicator(_value, _force = false) {
            if ((_value != this.outerIndicatorValue) || _force) {
                this.outerIndicatorValue = _value;
                if (this.outerIndicatorObject != null) {
                    var angle = (this.startAngle + (this.outerIndicatorValue * this.arcSize));
                    diffAndSetAttribute(this.outerIndicatorObject, "transform", "rotate(" + angle + ")");
                }
            }
        }
        refreshOuterDynamicArc(_start, _end, _force = false) {
            if ((_start != this.outerDynamicArcCurrentValues[0]) || (_end != this.outerDynamicArcCurrentValues[1]) || _force) {
                this.outerDynamicArcCurrentValues[0] = Utils.Clamp(_start, this.minValue, this.maxValue);
                this.outerDynamicArcCurrentValues[1] = Utils.Clamp(_end, this.minValue, this.maxValue);
                var d = "";
                if (this.outerDynamicArcCurrentValues[0] != this.outerDynamicArcCurrentValues[1]) {
                    var startAngle = this.valueToAngle(this.outerDynamicArcCurrentValues[0], true);
                    var startX = this.center.x + (Math.cos(startAngle) * this.outerDynamicArcRadius);
                    var startY = this.center.y + (Math.sin(startAngle) * this.outerDynamicArcRadius);
                    var endAngle = this.valueToAngle(this.outerDynamicArcCurrentValues[1], true);
                    var endX = this.center.x + (Math.cos(endAngle) * this.outerDynamicArcRadius);
                    var endY = this.center.y + (Math.sin(endAngle) * this.outerDynamicArcRadius);
                    var largeArcFlag = ((endAngle - startAngle) <= Math.PI) ? "0 0 0" : "0 1 0";
                    d = [
                        "M", endX, endY,
                        "A", this.outerDynamicArcRadius, this.outerDynamicArcRadius, largeArcFlag, startX, startY
                    ].join(" ");
                }
                diffAndSetAttribute(this.outerDynamicArcObject, "d", d);
            }
        }
    }
    A320_Neo_ECAM_Common.Gauge = Gauge;
})(A320_Neo_ECAM_Common || (A320_Neo_ECAM_Common = {}));
customElements.define('a320-neo-ecam-gauge', A320_Neo_ECAM_Common.Gauge);
//# sourceMappingURL=A320_Neo_ECAMGauge.js.map