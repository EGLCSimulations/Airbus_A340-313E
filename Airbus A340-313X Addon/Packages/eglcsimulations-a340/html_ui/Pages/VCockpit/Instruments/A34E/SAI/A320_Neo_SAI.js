class A320_Neo_SAI extends BaseAirliners {
    get templateID() { return "A320_Neo_SAI"; }
    connectedCallback() {
        super.connectedCallback();
        this.addIndependentElementContainer(new NavSystemElementContainer("Altimeter", "Altimeter", new A320_Neo_SAI_Altimeter()));
        this.addIndependentElementContainer(new NavSystemElementContainer("Airspeed", "Airspeed", new A320_Neo_SAI_Airspeed()));
        this.addIndependentElementContainer(new NavSystemElementContainer("Horizon", "Horizon", new A320_Neo_SAI_Attitude()));
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
}
class A320_Neo_SAI_Airspeed extends NavSystemElement {
    constructor() {
        super();
    }
    init(root) {
        this.airspeedElement = this.gps.getChildById("Airspeed");
    }
    onEnter() {
    }
    isReady() {
        return true;
    }
    onUpdate(_deltaTime) {
        this.airspeedElement.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class A320_Neo_SAI_AirspeedIndicator extends HTMLElement {
    constructor() {
        super(...arguments);
        this.greenColor = "green";
        this.yellowColor = "yellow";
        this.redColor = "red";
        this.fontSize = 25;
        this.graduationScrollPosX = 0;
        this.graduationScrollPosY = 0;
        this.graduationSpacing = 10;
        this.graduationMinValue = 30;
        this.nbPrimaryGraduations = 11;
        this.nbSecondaryGraduations = 3;
        this.totalGraduations = this.nbPrimaryGraduations + ((this.nbPrimaryGraduations - 1) * this.nbSecondaryGraduations);
    }
    connectedCallback() {
        this.graduationScroller = new Avionics.Scroller(this.nbPrimaryGraduations, 20);
        this.construct();
    }
    construct() {
        Utils.RemoveAllChildren(this);
        this.rootSVG = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSVG, "id", "ViewBox");
        diffAndSetAttribute(this.rootSVG, "viewBox", "0 0 250 500");
        var width = 40;
        var height = 250;
        var posX = width * 0.5;
        var posY = 0;
        if (!this.rootGroup) {
            this.rootGroup = document.createElementNS(Avionics.SVG.NS, "g");
            diffAndSetAttribute(this.rootGroup, "id", "Airspeed");
        }
        else {
            Utils.RemoveAllChildren(this.rootGroup);
        }
        var topMask = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(topMask, "d", "M0 0 l118 0 l0 30 q-118 2 -118 50 Z");
        diffAndSetAttribute(topMask, "fill", "black");
        this.rootGroup.appendChild(topMask);
        var bottomMask = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(bottomMask, "d", "M0 250 l118 0 l0 -35 q-118 -2 -118 -50 Z");
        diffAndSetAttribute(bottomMask, "fill", "black");
        this.rootGroup.appendChild(bottomMask);
        if (!this.centerSVG) {
            this.centerSVG = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(this.centerSVG, "id", "CenterGroup");
        }
        else
            Utils.RemoveAllChildren(this.centerSVG);
        diffAndSetAttribute(this.centerSVG, "x", (posX - width * 0.5) + '');
        diffAndSetAttribute(this.centerSVG, "y", posY + '');
        diffAndSetAttribute(this.centerSVG, "width", width + '');
        diffAndSetAttribute(this.centerSVG, "height", height + '');
        diffAndSetAttribute(this.centerSVG, "viewBox", "0 0 " + width + " " + height);
        {
            var _top = 0;
            var _left = 0;
            var _width = width;
            var _height = height;
            var bg = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(bg, "x", _left + '');
            diffAndSetAttribute(bg, "y", _top + '');
            diffAndSetAttribute(bg, "width", _width + '');
            diffAndSetAttribute(bg, "height", _height + '');
            diffAndSetAttribute(bg, "fill", "black");
            this.centerSVG.appendChild(bg);
            if (this.airspeeds) {
                var arcGroup = document.createElementNS(Avionics.SVG.NS, "g");
                diffAndSetAttribute(arcGroup, "id", "Arcs");
                {
                    this.arcs = [];
                    var _arcWidth = 18;
                    var _arcPosX = _left + _width + 3;
                    var _arcStartPosY = _top + _height * 0.5;
                    var arcHeight = this.arcToSVG(this.airspeeds.greenEnd - this.airspeeds.greenStart);
                    var arcPosY = _arcStartPosY - this.arcToSVG(this.airspeeds.greenStart) - arcHeight;
                    var arc = document.createElementNS(Avionics.SVG.NS, "rect");
                    diffAndSetAttribute(arc, "x", _arcPosX + '');
                    diffAndSetAttribute(arc, "y", arcPosY + '');
                    diffAndSetAttribute(arc, "width", _arcWidth + '');
                    diffAndSetAttribute(arc, "height", arcHeight + '');
                    diffAndSetAttribute(arc, "fill", this.greenColor);
                    this.arcs.push(arc);
                    var arcHeight = this.arcToSVG(this.airspeeds.yellowEnd - this.airspeeds.yellowStart);
                    var arcPosY = _arcStartPosY - this.arcToSVG(this.airspeeds.yellowStart) - arcHeight;
                    var arc = document.createElementNS(Avionics.SVG.NS, "rect");
                    diffAndSetAttribute(arc, "x", _arcPosX + '');
                    diffAndSetAttribute(arc, "y", arcPosY + '');
                    diffAndSetAttribute(arc, "width", _arcWidth + '');
                    diffAndSetAttribute(arc, "height", arcHeight + '');
                    diffAndSetAttribute(arc, "fill", this.yellowColor);
                    this.arcs.push(arc);
                    var arcHeight = this.arcToSVG(this.airspeeds.redEnd - this.airspeeds.redStart);
                    var arcPosY = _arcStartPosY - this.arcToSVG(this.airspeeds.redStart) - arcHeight;
                    var arc = document.createElementNS(Avionics.SVG.NS, "rect");
                    diffAndSetAttribute(arc, "x", _arcPosX + '');
                    diffAndSetAttribute(arc, "y", arcPosY + '');
                    diffAndSetAttribute(arc, "width", _arcWidth + '');
                    diffAndSetAttribute(arc, "height", arcHeight + '');
                    diffAndSetAttribute(arc, "fill", this.redColor);
                    this.arcs.push(arc);
                    var arcHeight = this.arcToSVG(this.airspeeds.whiteEnd - this.airspeeds.whiteStart);
                    var arcPosY = _arcStartPosY - this.arcToSVG(this.airspeeds.whiteStart) - arcHeight;
                    var arc = document.createElementNS(Avionics.SVG.NS, "rect");
                    diffAndSetAttribute(arc, "x", (_arcPosX + _arcWidth * 0.5) + '');
                    diffAndSetAttribute(arc, "y", arcPosY + '');
                    diffAndSetAttribute(arc, "width", (_arcWidth * 0.5) + '');
                    diffAndSetAttribute(arc, "height", arcHeight + '');
                    diffAndSetAttribute(arc, "fill", "white");
                    this.arcs.push(arc);
                    for (var i = 0; i < this.arcs.length; i++) {
                        arcGroup.appendChild(this.arcs[i]);
                    }
                    this.centerSVG.appendChild(arcGroup);
                }
            }
            var graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
            diffAndSetAttribute(graduationGroup, "id", "Graduations");
            {
                this.graduationScrollPosX = _left + _width;
                this.graduationScrollPosY = _top + _height * 0.5;
                this.graduations = [];
                for (var i = 0; i < this.totalGraduations; i++) {
                    var line = new Avionics.SVGGraduation();
                    var mod = i % (this.nbSecondaryGraduations + 1);
                    line.IsPrimary = (mod == 0) ? true : false;
                    var lineWidth = (mod == 2) ? 10 : 4;
                    var lineHeight = (mod == 2) ? 2 : 2;
                    var linePosX = -lineWidth;
                    line.SVGLine = document.createElementNS(Avionics.SVG.NS, "rect");
                    diffAndSetAttribute(line.SVGLine, "x", linePosX + '');
                    diffAndSetAttribute(line.SVGLine, "width", lineWidth + '');
                    diffAndSetAttribute(line.SVGLine, "height", lineHeight + '');
                    diffAndSetAttribute(line.SVGLine, "fill", "white");
                    if (mod == 0) {
                        line.SVGText1 = document.createElementNS(Avionics.SVG.NS, "text");
                        diffAndSetAttribute(line.SVGText1, "x", (linePosX - 2) + '');
                        diffAndSetAttribute(line.SVGText1, "fill", "white");
                        diffAndSetAttribute(line.SVGText1, "font-size", (this.fontSize * 0.65) + '');
                        diffAndSetAttribute(line.SVGText1, "font-family", "Roboto-Bold");
                        diffAndSetAttribute(line.SVGText1, "text-anchor", "end");
                        diffAndSetAttribute(line.SVGText1, "alignment-baseline", "central");
                    }
                    this.graduations.push(line);
                }
                for (var i = 0; i < this.totalGraduations; i++) {
                    var line = this.graduations[i];
                    graduationGroup.appendChild(line.SVGLine);
                    if (line.SVGText1) {
                        graduationGroup.appendChild(line.SVGText1);
                    }
                }
                this.centerSVG.appendChild(graduationGroup);
            }
        }
        this.rootGroup.appendChild(this.centerSVG);
        var cursorPosX = _left + _width;
        var cursorPosY = _top + _height * 0.5;
        var cursorWidth = 12;
        var cursorHeight = 18;
        if (!this.cursorSVG) {
            this.cursorSVG = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(this.cursorSVG, "id", "CursorGroup");
        }
        else
            Utils.RemoveAllChildren(this.cursorSVG);
        diffAndSetAttribute(this.cursorSVG, "x", cursorPosX + '');
        diffAndSetAttribute(this.cursorSVG, "y", (cursorPosY - cursorHeight * 0.5) + '');
        diffAndSetAttribute(this.cursorSVG, "width", cursorWidth + '');
        diffAndSetAttribute(this.cursorSVG, "height", cursorHeight + '');
        diffAndSetAttribute(this.cursorSVG, "viewBox", "0 0 " + cursorWidth + " " + cursorHeight);
        {
            var rect = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(rect, "x", "0");
            diffAndSetAttribute(rect, "y", "0");
            diffAndSetAttribute(rect, "width", cursorWidth + '');
            diffAndSetAttribute(rect, "height", cursorHeight + '');
            diffAndSetAttribute(rect, "fill", "black");
            this.cursorSVG.appendChild(rect);
            if (!this.cursorSVGShape)
                this.cursorSVGShape = document.createElementNS(Avionics.SVG.NS, "path");
            diffAndSetAttribute(this.cursorSVGShape, "d", "M 0 " + (cursorHeight * 0.5) + " L" + cursorWidth + " 0 L" + cursorWidth + " " + cursorHeight + " Z");
            diffAndSetAttribute(this.cursorSVGShape, "fill", "yellow");
            this.cursorSVG.appendChild(this.cursorSVGShape);
            this.rootGroup.appendChild(this.cursorSVG);
        }
        var topBg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(topBg, "x", _left + '');
        diffAndSetAttribute(topBg, "y", (_top - 5) + '');
        diffAndSetAttribute(topBg, "width", "125");
        diffAndSetAttribute(topBg, "height", "35");
        diffAndSetAttribute(topBg, "fill", "black");
        this.rootGroup.appendChild(topBg);
        var bottomBg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(bottomBg, "x", _left + '');
        diffAndSetAttribute(bottomBg, "y", (_top + _height - 35) + '');
        diffAndSetAttribute(bottomBg, "width", "125");
        diffAndSetAttribute(bottomBg, "height", "40");
        diffAndSetAttribute(bottomBg, "fill", "black");
        this.rootGroup.appendChild(bottomBg);
        this.rootSVG.appendChild(this.rootGroup);
        this.appendChild(this.rootSVG);
    }
    update(dTime) {
        var indicatedSpeed = Simplane.getIndicatedSpeed();
        this.updateArcScrolling(indicatedSpeed);
        this.updateGraduationScrolling(indicatedSpeed);
    }
    arcToSVG(_value) {
        var pixels = (_value * this.graduationSpacing * (this.nbSecondaryGraduations + 1)) / 10;
        return pixels;
    }
    updateGraduationScrolling(_speed) {
        if (this.graduations) {
            if (_speed < this.graduationMinValue)
                _speed = this.graduationMinValue;
            if (this.graduationScroller.scroll(_speed)) {
                var currentVal = this.graduationScroller.firstValue;
                var currentY = this.graduationScrollPosY + this.graduationScroller.offsetY * this.graduationSpacing * (this.nbSecondaryGraduations + 1);
                for (var i = 0; i < this.totalGraduations; i++) {
                    var posX = this.graduationScrollPosX;
                    var posY = currentY;
                    if ((currentVal < this.graduationMinValue) || (currentVal == this.graduationMinValue && !this.graduations[i].SVGText1)) {
                        diffAndSetAttribute(this.graduations[i].SVGLine, "visibility", "hidden");
                        if (this.graduations[i].SVGText1) {
                            diffAndSetAttribute(this.graduations[i].SVGText1, "visibility", "hidden");
                        }
                    }
                    else {
                        diffAndSetAttribute(this.graduations[i].SVGLine, "transform", "translate(" + posX + '' + " " + posY + '' + ")");
                        if (this.graduations[i].SVGText1) {
                            diffAndSetText(this.graduations[i].SVGText1, currentVal + '');
                            diffAndSetAttribute(this.graduations[i].SVGText1, "transform", "translate(" + posX + '' + " " + posY + '' + ")");
                        }
                    }
                    if (this.graduations[i].SVGText1)
                        currentVal = this.graduationScroller.nextValue;
                    currentY -= this.graduationSpacing;
                }
            }
        }
    }
    updateArcScrolling(_speed) {
        if (this.arcs) {
            var offset = this.arcToSVG(_speed);
            for (var i = 0; i < this.arcs.length; i++) {
                diffAndSetAttribute(this.arcs[i], "transform", "translate(0 " + offset + '' + ")");
            }
        }
    }
}
customElements.define('a320-neo-sai-airspeed-indicator', A320_Neo_SAI_AirspeedIndicator);
class A320_Neo_SAI_Altimeter extends NavSystemElement {
    constructor() {
        super();
    }
    init(root) {
        this.altimeterElement = this.gps.getChildById("Altimeter");
    }
    onEnter() {
    }
    isReady() {
        return true;
        ;
    }
    onUpdate(_deltaTime) {
        this.altimeterElement.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
        switch (_event) {
            case "BARO_INC":
                SimVar.SetSimVarValue("K:KOHLSMAN_INC", "number", 1);
                break;
            case "BARO_DEC":
                SimVar.SetSimVarValue("K:KOHLSMAN_DEC", "number", 1);
                break;
        }
    }
}
class A320_Neo_SAI_AltimeterIndicator extends HTMLElement {
    constructor() {
        super(...arguments);
        this.fontSize = 25;
        this.graduationScrollPosX = 0;
        this.graduationScrollPosY = 0;
        this.nbPrimaryGraduations = 7;
        this.nbSecondaryGraduations = 4;
        this.totalGraduations = this.nbPrimaryGraduations + ((this.nbPrimaryGraduations - 1) * this.nbSecondaryGraduations);
        this.graduationSpacing = 14;
    }
    connectedCallback() {
        this.graduationScroller = new Avionics.Scroller(this.nbPrimaryGraduations, 500, true);
        this.cursorIntegrals = new Array();
        this.cursorIntegrals.push(new Avionics.AltitudeScroller(3, 65, 1, 10, 1000));
        this.cursorIntegrals.push(new Avionics.AltitudeScroller(3, 65, 1, 10, 100));
        this.cursorIntegrals.push(new Avionics.AltitudeScroller(3, 65, 1, 10, 10));
        this.cursorDecimals = new Avionics.AltitudeScroller(3, 32, 10, 100);
        this.construct();
    }
    construct() {
        Utils.RemoveAllChildren(this);
        this.rootSVG = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSVG, "id", "ViewBox");
        diffAndSetAttribute(this.rootSVG, "viewBox", "0 0 250 500");
        var width = 60;
        var height = 250;
        var posX = 40 + width * 0.5;
        var posY = 0;
        if (!this.rootGroup) {
            this.rootGroup = document.createElementNS(Avionics.SVG.NS, "g");
            diffAndSetAttribute(this.rootGroup, "id", "Altimeter");
        }
        else {
            Utils.RemoveAllChildren(this.rootGroup);
        }
        if (!this.centerSVG) {
            this.centerSVG = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(this.centerSVG, "id", "CenterGroup");
        }
        else
            Utils.RemoveAllChildren(this.centerSVG);
        var topMask = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(topMask, "d", "M0 0 l0 30 q118 2 118 50 l0 -80 Z");
        diffAndSetAttribute(topMask, "fill", "black");
        this.rootGroup.appendChild(topMask);
        var bottomMask = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(bottomMask, "d", "M0 250 l0 -35 q118 -2 118 -50 l0 85 Z");
        diffAndSetAttribute(bottomMask, "fill", "black");
        this.rootGroup.appendChild(bottomMask);
        diffAndSetAttribute(this.centerSVG, "x", posX + '');
        diffAndSetAttribute(this.centerSVG, "y", posY + '');
        diffAndSetAttribute(this.centerSVG, "width", width + '');
        diffAndSetAttribute(this.centerSVG, "height", height + '');
        diffAndSetAttribute(this.centerSVG, "viewBox", "0 0 " + width + " " + height);
        diffAndSetAttribute(this.centerSVG, "overflow", "hidden");
        {
            var _top = 0;
            var _left = 0;
            var _width = width;
            var _height = height;
            var bg = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(bg, "x", _left + '');
            diffAndSetAttribute(bg, "y", _top + '');
            diffAndSetAttribute(bg, "width", _width + '');
            diffAndSetAttribute(bg, "height", _height + '');
            diffAndSetAttribute(bg, "fill", "black");
            this.centerSVG.appendChild(bg);
            this.graduationScrollPosX = _left;
            this.graduationScrollPosY = _top + _height * 0.5;
            this.graduations = [];
            for (var i = 0; i < this.totalGraduations; i++) {
                var line = new Avionics.SVGGraduation();
                line.IsPrimary = true;
                if (this.nbSecondaryGraduations > 0 && (i % (this.nbSecondaryGraduations + 1)))
                    line.IsPrimary = false;
                var lineWidth = line.IsPrimary ? 4 : 12;
                line.SVGLine = document.createElementNS(Avionics.SVG.NS, "rect");
                diffAndSetAttribute(line.SVGLine, "x", "0");
                diffAndSetAttribute(line.SVGLine, "width", lineWidth + '');
                diffAndSetAttribute(line.SVGLine, "height", "2");
                diffAndSetAttribute(line.SVGLine, "fill", "white");
                if (line.IsPrimary) {
                    line.SVGText1 = document.createElementNS(Avionics.SVG.NS, "text");
                    diffAndSetAttribute(line.SVGText1, "x", (lineWidth + 2) + '');
                    diffAndSetAttribute(line.SVGText1, "fill", "white");
                    diffAndSetAttribute(line.SVGText1, "font-size", (this.fontSize * 0.85) + '');
                    diffAndSetAttribute(line.SVGText1, "font-family", "Roboto-Bold");
                    diffAndSetAttribute(line.SVGText1, "text-anchor", "start");
                    diffAndSetAttribute(line.SVGText1, "alignment-baseline", "central");
                }
                this.graduations.push(line);
            }
            var graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
            diffAndSetAttribute(graduationGroup, "id", "graduationGroup");
            for (var i = 0; i < this.totalGraduations; i++) {
                var line = this.graduations[i];
                graduationGroup.appendChild(line.SVGLine);
                if (line.SVGText1)
                    graduationGroup.appendChild(line.SVGText1);
                if (line.SVGText2)
                    graduationGroup.appendChild(line.SVGText2);
            }
            this.centerSVG.appendChild(graduationGroup);
        }
        this.rootGroup.appendChild(this.centerSVG);
        _left = posX - width * 0.5;
        var cursorPosX = _left + 5;
        var cursorPosY = _top + _height * 0.5;
        var cursorWidth = width * 1.25;
        var cursorHeight = 39;
        if (!this.cursorSVG) {
            this.cursorSVG = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(this.cursorSVG, "id", "CursorGroup");
        }
        else
            Utils.RemoveAllChildren(this.cursorSVG);
        diffAndSetAttribute(this.cursorSVG, "x", cursorPosX + '');
        diffAndSetAttribute(this.cursorSVG, "y", (cursorPosY - cursorHeight * 0.5) + '');
        diffAndSetAttribute(this.cursorSVG, "width", cursorWidth + '');
        diffAndSetAttribute(this.cursorSVG, "height", cursorHeight + '');
        diffAndSetAttribute(this.cursorSVG, "viewBox", "0 4 " + cursorWidth + " " + cursorHeight);
        {
            let _scale = 0.6;
            var trs = document.createElementNS(Avionics.SVG.NS, "g");
            diffAndSetAttribute(trs, "transform", "scale(" + _scale + ")");
            this.cursorSVG.appendChild(trs);
            if (!this.cursorSVGShape)
                this.cursorSVGShape = document.createElementNS(Avionics.SVG.NS, "path");
            diffAndSetAttribute(this.cursorSVGShape, "fill", "black");
            diffAndSetAttribute(this.cursorSVGShape, "d", "M0 22 L65 22 L65 6 L140 6 L140 72 L65 72 L65 56 L0 56 Z");
            diffAndSetAttribute(this.cursorSVGShape, "stroke", "yellow");
            diffAndSetAttribute(this.cursorSVGShape, "stroke-width", "0.85");
            trs.appendChild(this.cursorSVGShape);
            var _cursorWidth = (cursorWidth / _scale);
            var _cursorHeight = (cursorHeight / _scale + 10);
            var _cursorPosX = 0;
            var _cursorPosY = _cursorHeight * 0.5;
            let integralsGroup = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(integralsGroup, "x", "0");
            diffAndSetAttribute(integralsGroup, "y", "23");
            diffAndSetAttribute(integralsGroup, "width", _cursorWidth + '');
            diffAndSetAttribute(integralsGroup, "height", (_cursorHeight - 43) + '');
            diffAndSetAttribute(integralsGroup, "viewBox", "0 0 " + (_cursorWidth) + " " + (_cursorHeight));
            trs.appendChild(integralsGroup);
            {
                this.cursorIntegrals[0].construct(integralsGroup, _cursorPosX - 22, _cursorPosY - 2, _width, "Roboto-Bold", this.fontSize * 3, "green");
                this.cursorIntegrals[1].construct(integralsGroup, _cursorPosX + 24, _cursorPosY - 2, _width, "Roboto-Bold", this.fontSize * 3, "green");
                this.cursorIntegrals[2].construct(integralsGroup, _cursorPosX + 70, _cursorPosY - 2, _width, "Roboto-Bold", this.fontSize * 3, "green");
            }
            this.cursorDecimals.construct(trs, _cursorPosX + 118, _cursorPosY, _width, "Roboto-Bold", this.fontSize * 1.6, "green");
            this.rootGroup.appendChild(this.cursorSVG);
        }
        var topBg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(topBg, "x", (_left - 40) + '');
        diffAndSetAttribute(topBg, "y", (_top - 5) + '');
        diffAndSetAttribute(topBg, "width", "125");
        diffAndSetAttribute(topBg, "height", "35");
        diffAndSetAttribute(topBg, "fill", "black");
        this.rootGroup.appendChild(topBg);
        var bottomBg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(bottomBg, "x", (_left - 40) + '');
        diffAndSetAttribute(bottomBg, "y", (_top + _height - 35) + '');
        diffAndSetAttribute(bottomBg, "width", "125");
        diffAndSetAttribute(bottomBg, "height", "40");
        diffAndSetAttribute(bottomBg, "fill", "black");
        this.rootGroup.appendChild(bottomBg);
        this.rootSVG.appendChild(this.rootGroup);
        this.appendChild(this.rootSVG);
    }
    update(_dTime) {
        var altitude = SimVar.GetSimVarValue("INDICATED ALTITUDE:2", "feet");
        this.updateGraduationScrolling(altitude);
        this.updateCursorScrolling(altitude);
        this.updateBaroPressure();
    }
    updateBaroPressure() {
        if (this.pressureSVG) {
            var pressure = SimVar.GetSimVarValue("KOHLSMAN SETTING HG:2", "inches of mercury");
            diffAndSetText(this.pressureSVG, fastToFixed(pressure, 2) + " in");
        }
    }
    updateGraduationScrolling(_altitude) {
        if (this.graduations && this.graduationScroller.scroll(_altitude)) {
            var currentVal = this.graduationScroller.firstValue;
            var currentY = this.graduationScrollPosY + this.graduationScroller.offsetY * this.graduationSpacing * (this.nbSecondaryGraduations + 1);
            var firstRoundValueY = currentY;
            for (var i = 0; i < this.totalGraduations; i++) {
                var posX = this.graduationScrollPosX;
                var posY = Math.round(currentY);
                diffAndSetAttribute(this.graduations[i].SVGLine, "transform", "translate(" + posX + '' + " " + posY + '' + ")");
                if (this.graduations[i].SVGText1) {
                    var roundedVal = 0;
                    roundedVal = Math.floor(Math.abs(currentVal));
                    var integral = Math.floor(roundedVal / 100);
                    diffAndSetText(this.graduations[i].SVGText1, Utils.leadingZeros(integral, 3));
                    diffAndSetAttribute(this.graduations[i].SVGText1, "transform", "translate(" + posX + '' + " " + posY + '' + ")");
                    if (this.graduations[i].SVGText2)
                        diffAndSetAttribute(this.graduations[i].SVGText2, "transform", "translate(" + posX + '' + " " + posY + '' + ")");
                    firstRoundValueY = posY;
                    currentVal = this.graduationScroller.nextValue;
                }
                currentY -= this.graduationSpacing;
            }
            if (this.graduationBarSVG) {
                diffAndSetAttribute(this.graduationBarSVG, "transform", "translate(0 " + firstRoundValueY + ")");
            }
        }
    }
    updateCursorScrolling(_altitude) {
        if (this.cursorIntegrals) {
            this.cursorIntegrals[0].update(_altitude, 10000, 10000);
            this.cursorIntegrals[1].update(_altitude, 1000, 1000);
            this.cursorIntegrals[2].update(_altitude, 100);
        }
        if (this.cursorDecimals) {
            this.cursorDecimals.update(_altitude);
        }
    }
}
customElements.define('a320-neo-sai-altimeter-indicator', A320_Neo_SAI_AltimeterIndicator);
class A320_Neo_SAI_Attitude extends NavSystemElement {
    init(root) {
        this.attitudeElement = this.gps.getChildById("Horizon");
        diffAndSetAttribute(this.attitudeElement, "is-backup", "true");
        if (this.gps) {
            var aspectRatio = this.gps.getAspectRatio();
            diffAndSetAttribute(this.attitudeElement, "aspect-ratio", aspectRatio + '');
        }
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var xyz = Simplane.getOrientationAxis();
        if (xyz) {
            diffAndSetAttribute(this.attitudeElement, "pitch", (xyz.pitch / Math.PI * 180) + '');
            diffAndSetAttribute(this.attitudeElement, "bank", (xyz.bank / Math.PI * 180) + '');
            diffAndSetAttribute(this.attitudeElement, "slip_skid", Simplane.getInclinometer() + '');
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class A320_Neo_SAI_AttitudeIndicator extends HTMLElement {
    constructor() {
        super();
        this.backgroundVisible = true;
        this.bankSizeRatio = -8.25;
        this.bankSizeRatioFactor = 1.0;
    }
    static get observedAttributes() {
        return [
            "pitch",
            "bank",
            "slip_skid",
            "background",
        ];
    }
    connectedCallback() {
        this.construct();
    }
    construct() {
        Utils.RemoveAllChildren(this);
        this.bankSizeRatioFactor = 0.62;
        {
            this.horizon_root = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(this.horizon_root, "width", "100%");
            diffAndSetAttribute(this.horizon_root, "height", "100%");
            diffAndSetAttribute(this.horizon_root, "viewBox", "-200 -200 400 300");
            diffAndSetAttribute(this.horizon_root, "x", "-100");
            diffAndSetAttribute(this.horizon_root, "y", "-100");
            diffAndSetAttribute(this.horizon_root, "overflow", "visible");
            diffAndSetAttribute(this.horizon_root, "style", "position:absolute; z-index: -3; width: 100%; height:100%;");
            diffAndSetAttribute(this.horizon_root, "transform", "translate(0, 100)");
            this.appendChild(this.horizon_root);
            this.horizonTopColor = "#3D9FFF";
            this.horizonBottomColor = "#905A45";
            this.horizonTop = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(this.horizonTop, "fill", (this.backgroundVisible) ? this.horizonTopColor : "transparent");
            diffAndSetAttribute(this.horizonTop, "x", "-1000");
            diffAndSetAttribute(this.horizonTop, "y", "-1000");
            diffAndSetAttribute(this.horizonTop, "width", "2000");
            diffAndSetAttribute(this.horizonTop, "height", "2000");
            this.horizon_root.appendChild(this.horizonTop);
            this.bottomPart = document.createElementNS(Avionics.SVG.NS, "g");
            this.horizon_root.appendChild(this.bottomPart);
            this.horizonBottom = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(this.horizonBottom, "fill", (this.backgroundVisible) ? this.horizonBottomColor : "transparent");
            diffAndSetAttribute(this.horizonBottom, "x", "-1500");
            diffAndSetAttribute(this.horizonBottom, "y", "0");
            diffAndSetAttribute(this.horizonBottom, "width", "3000");
            diffAndSetAttribute(this.horizonBottom, "height", "3000");
            this.bottomPart.appendChild(this.horizonBottom);
            let separator = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(separator, "fill", "#e0e0e0");
            diffAndSetAttribute(separator, "x", "-1500");
            diffAndSetAttribute(separator, "y", "-3");
            diffAndSetAttribute(separator, "width", "3000");
            diffAndSetAttribute(separator, "height", "6");
            this.bottomPart.appendChild(separator);
        }
        {
            let pitchContainer = document.createElement("div");
            diffAndSetAttribute(pitchContainer, "id", "Pitch");
            pitchContainer.style.top = "-14%";
            pitchContainer.style.left = "-10%";
            pitchContainer.style.width = "120%";
            pitchContainer.style.height = "120%";
            pitchContainer.style.position = "absolute";
            pitchContainer.style.transform = "scale(1.35)";
            this.appendChild(pitchContainer);
            this.pitch_root = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(this.pitch_root, "width", "100%");
            diffAndSetAttribute(this.pitch_root, "height", "100%");
            diffAndSetAttribute(this.pitch_root, "viewBox", "-200 -200 400 300");
            diffAndSetAttribute(this.pitch_root, "overflow", "visible");
            diffAndSetAttribute(this.pitch_root, "style", "position:absolute; z-index: -2;");
            pitchContainer.appendChild(this.pitch_root);
            {
                this.pitch_root_group = document.createElementNS(Avionics.SVG.NS, "g");
                this.pitch_root.appendChild(this.pitch_root_group);
                var x = -115;
                var y = -122;
                var w = 230;
                var h = 275;
                let attitudePitchContainer = document.createElementNS(Avionics.SVG.NS, "svg");
                diffAndSetAttribute(attitudePitchContainer, "width", w + '');
                diffAndSetAttribute(attitudePitchContainer, "height", h + '');
                diffAndSetAttribute(attitudePitchContainer, "x", x + '');
                diffAndSetAttribute(attitudePitchContainer, "y", y + '');
                diffAndSetAttribute(attitudePitchContainer, "viewBox", x + " " + y + " " + w + " " + h);
                diffAndSetAttribute(attitudePitchContainer, "overflow", "hidden");
                this.pitch_root_group.appendChild(attitudePitchContainer);
                {
                    this.attitude_pitch = document.createElementNS(Avionics.SVG.NS, "g");
                    attitudePitchContainer.appendChild(this.attitude_pitch);
                    let maxDash = 80;
                    let fullPrecisionLowerLimit = -20;
                    let fullPrecisionUpperLimit = 20;
                    let halfPrecisionLowerLimit = -30;
                    let halfPrecisionUpperLimit = 45;
                    let unusualAttitudeLowerLimit = -30;
                    let unusualAttitudeUpperLimit = 50;
                    let bigWidth = 50;
                    let bigHeight = 3;
                    let mediumWidth = 30;
                    let mediumHeight = 3;
                    let smallWidth = 10;
                    let smallHeight = 2;
                    let fontSize = 20;
                    let angle = -maxDash;
                    let nextAngle;
                    let width;
                    let height;
                    let text;
                    while (angle <= maxDash) {
                        if (angle % 10 == 0) {
                            width = bigWidth;
                            height = bigHeight;
                            text = true;
                            if (angle >= fullPrecisionLowerLimit && angle < fullPrecisionUpperLimit) {
                                nextAngle = angle + 2.5;
                            }
                            else if (angle >= halfPrecisionLowerLimit && angle < halfPrecisionUpperLimit) {
                                nextAngle = angle + 5;
                            }
                            else {
                                nextAngle = angle + 10;
                            }
                        }
                        else {
                            if (angle % 5 == 0) {
                                width = mediumWidth;
                                height = mediumHeight;
                                text = false;
                                if (angle >= fullPrecisionLowerLimit && angle < fullPrecisionUpperLimit) {
                                    nextAngle = angle + 2.5;
                                }
                                else {
                                    nextAngle = angle + 5;
                                }
                            }
                            else {
                                width = smallWidth;
                                height = smallHeight;
                                nextAngle = angle + 2.5;
                                text = false;
                            }
                        }
                        if (angle != 0) {
                            let rect = document.createElementNS(Avionics.SVG.NS, "rect");
                            diffAndSetAttribute(rect, "fill", "white");
                            diffAndSetAttribute(rect, "x", (-width / 2) + '');
                            diffAndSetAttribute(rect, "y", (this.bankSizeRatio * angle - height / 2) + '');
                            diffAndSetAttribute(rect, "width", width + '');
                            diffAndSetAttribute(rect, "height", height + '');
                            this.attitude_pitch.appendChild(rect);
                            if (text) {
                                let leftText = document.createElementNS(Avionics.SVG.NS, "text");
                                diffAndSetText(leftText, Math.abs(angle) + '');
                                diffAndSetAttribute(leftText, "x", ((-width / 2) - 5) + '');
                                diffAndSetAttribute(leftText, "y", (this.bankSizeRatio * angle - height / 2 + fontSize / 2) + '');
                                diffAndSetAttribute(leftText, "text-anchor", "end");
                                diffAndSetAttribute(leftText, "font-size", (fontSize * 1.2) + '');
                                diffAndSetAttribute(leftText, "font-family", "Roboto-Bold");
                                diffAndSetAttribute(leftText, "fill", "white");
                                this.attitude_pitch.appendChild(leftText);
                            }
                            if (angle < unusualAttitudeLowerLimit) {
                                let chevron = document.createElementNS(Avionics.SVG.NS, "path");
                                let path = "M" + -smallWidth / 2 + " " + (this.bankSizeRatio * nextAngle - bigHeight / 2) + " l" + smallWidth + "  0 ";
                                path += "L" + bigWidth / 2 + " " + (this.bankSizeRatio * angle - bigHeight / 2) + " l" + -smallWidth + " 0 ";
                                path += "L0 " + (this.bankSizeRatio * nextAngle + 20) + " ";
                                path += "L" + (-bigWidth / 2 + smallWidth) + " " + (this.bankSizeRatio * angle - bigHeight / 2) + " l" + -smallWidth + " 0 Z";
                                diffAndSetAttribute(chevron, "d", path);
                                diffAndSetAttribute(chevron, "fill", "red");
                                this.attitude_pitch.appendChild(chevron);
                            }
                            if (angle >= unusualAttitudeUpperLimit && nextAngle <= maxDash) {
                                let chevron = document.createElementNS(Avionics.SVG.NS, "path");
                                let path = "M" + -smallWidth / 2 + " " + (this.bankSizeRatio * angle - bigHeight / 2) + " l" + smallWidth + "  0 ";
                                path += "L" + (bigWidth / 2) + " " + (this.bankSizeRatio * nextAngle + bigHeight / 2) + " l" + -smallWidth + " 0 ";
                                path += "L0 " + (this.bankSizeRatio * angle - 20) + " ";
                                path += "L" + (-bigWidth / 2 + smallWidth) + " " + (this.bankSizeRatio * nextAngle + bigHeight / 2) + " l" + -smallWidth + " 0 Z";
                                diffAndSetAttribute(chevron, "d", path);
                                diffAndSetAttribute(chevron, "fill", "red");
                                this.attitude_pitch.appendChild(chevron);
                            }
                        }
                        angle = nextAngle;
                    }
                }
            }
        }
        {
            let attitudeContainer = document.createElement("div");
            diffAndSetAttribute(attitudeContainer, "id", "Attitude");
            attitudeContainer.style.top = "-14%";
            attitudeContainer.style.left = "-10%";
            attitudeContainer.style.width = "120%";
            attitudeContainer.style.height = "120%";
            attitudeContainer.style.position = "absolute";
            attitudeContainer.style.transform = "scale(1.35)";
            this.appendChild(attitudeContainer);
            this.attitude_root = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(this.attitude_root, "width", "100%");
            diffAndSetAttribute(this.attitude_root, "height", "100%");
            diffAndSetAttribute(this.attitude_root, "viewBox", "-200 -200 400 300");
            diffAndSetAttribute(this.attitude_root, "overflow", "visible");
            diffAndSetAttribute(this.attitude_root, "style", "position:absolute; z-index: 0");
            attitudeContainer.appendChild(this.attitude_root);
            {
                this.attitude_bank = document.createElementNS(Avionics.SVG.NS, "g");
                this.attitude_root.appendChild(this.attitude_bank);
                let topTriangle = document.createElementNS(Avionics.SVG.NS, "path");
                diffAndSetAttribute(topTriangle, "d", "M0 -180 l-7.5 -10 l15 0 Z");
                diffAndSetAttribute(topTriangle, "fill", "white");
                diffAndSetAttribute(topTriangle, "stroke", "white");
                diffAndSetAttribute(topTriangle, "stroke-width", "1");
                diffAndSetAttribute(topTriangle, "stroke-opacity", "1");
                this.attitude_bank.appendChild(topTriangle);
                let smallDashesAngle = [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50];
                let smallDashesHeight = [18, 18, 18, 11, 11, 11, 11, 18, 18, 18];
                let radius = 175;
                for (let i = 0; i < smallDashesAngle.length; i++) {
                    let dash = document.createElementNS(Avionics.SVG.NS, "line");
                    diffAndSetAttribute(dash, "x1", "0");
                    diffAndSetAttribute(dash, "y1", (-radius) + '');
                    diffAndSetAttribute(dash, "x2", "0");
                    diffAndSetAttribute(dash, "y2", (-radius - smallDashesHeight[i]) + '');
                    diffAndSetAttribute(dash, "fill", "none");
                    diffAndSetAttribute(dash, "stroke", "white");
                    diffAndSetAttribute(dash, "stroke-width", "2");
                    diffAndSetAttribute(dash, "transform", "rotate(" + smallDashesAngle[i] + ",0,0)");
                    this.attitude_bank.appendChild(dash);
                }
                let arc = document.createElementNS(Avionics.SVG.NS, "path");
                diffAndSetAttribute(arc, "d", "M-88 -150 q88 -48 176 0");
                diffAndSetAttribute(arc, "fill", "transparent");
                diffAndSetAttribute(arc, "stroke", "white");
                diffAndSetAttribute(arc, "stroke-width", "1.5");
                this.attitude_bank.appendChild(arc);
            }
            {
                let cursors = document.createElementNS(Avionics.SVG.NS, "g");
                this.attitude_root.appendChild(cursors);
                let leftUpper = document.createElementNS(Avionics.SVG.NS, "path");
                diffAndSetAttribute(leftUpper, "d", "M-90 0 l0 -6 l55 0 l0 28 l-5 0 l0 -22 l-40 0 Z");
                diffAndSetAttribute(leftUpper, "fill", "black");
                diffAndSetAttribute(leftUpper, "stroke", "yellow");
                diffAndSetAttribute(leftUpper, "stroke-width", "0.7");
                diffAndSetAttribute(leftUpper, "stroke-opacity", "1.0");
                cursors.appendChild(leftUpper);
                let rightUpper = document.createElementNS(Avionics.SVG.NS, "path");
                diffAndSetAttribute(rightUpper, "d", "M90 0 l0 -6 l-55 0 l0 28 l5 0 l0 -22 l40 0 Z");
                diffAndSetAttribute(rightUpper, "fill", "black");
                diffAndSetAttribute(rightUpper, "stroke", "yellow");
                diffAndSetAttribute(rightUpper, "stroke-width", "0.7");
                diffAndSetAttribute(rightUpper, "stroke-opacity", "1.0");
                cursors.appendChild(rightUpper);
                let centerRect = document.createElementNS(Avionics.SVG.NS, "rect");
                diffAndSetAttribute(centerRect, "x", "-4");
                diffAndSetAttribute(centerRect, "y", "-8");
                diffAndSetAttribute(centerRect, "height", "8");
                diffAndSetAttribute(centerRect, "width", "8");
                diffAndSetAttribute(centerRect, "stroke", "yellow");
                diffAndSetAttribute(centerRect, "stroke-width", "3");
                cursors.appendChild(centerRect);
                this.slipSkidTriangle = document.createElementNS(Avionics.SVG.NS, "path");
                diffAndSetAttribute(this.slipSkidTriangle, "d", "M0 -170 l-13 20 l26 0 Z");
                diffAndSetAttribute(this.slipSkidTriangle, "fill", "black");
                diffAndSetAttribute(this.slipSkidTriangle, "stroke", "white");
                diffAndSetAttribute(this.slipSkidTriangle, "stroke-width", "1");
                this.attitude_root.appendChild(this.slipSkidTriangle);
                this.slipSkid = document.createElementNS(Avionics.SVG.NS, "path");
                diffAndSetAttribute(this.slipSkid, "d", "M-20 -140 L-16 -146 L16 -146 L20 -140 Z");
                diffAndSetAttribute(this.slipSkid, "fill", "black");
                diffAndSetAttribute(this.slipSkid, "stroke", "white");
                diffAndSetAttribute(this.slipSkid, "stroke-width", "1");
                this.attitude_root.appendChild(this.slipSkid);
            }
        }
        this.applyAttributes();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue == newValue)
            return;
        switch (name) {
            case "pitch":
                this.pitch = parseFloat(newValue);
                break;
            case "bank":
                this.bank = parseFloat(newValue);
                break;
            case "slip_skid":
                this.slipSkidValue = parseFloat(newValue);
                break;
            case "background":
                if (newValue == "false")
                    this.backgroundVisible = false;
                else
                    this.backgroundVisible = true;
                break;
            default:
                return;
        }
        this.applyAttributes();
    }
    applyAttributes() {
        if (this.bottomPart)
            diffAndSetAttribute(this.bottomPart, "transform", "rotate(" + this.bank + ", 0, 0) translate(0," + (this.pitch * this.bankSizeRatio) + ")");
        if (this.pitch_root_group)
            diffAndSetAttribute(this.pitch_root_group, "transform", "rotate(" + this.bank + ", 0, 0)");
        if (this.attitude_pitch)
            diffAndSetAttribute(this.attitude_pitch, "transform", "translate(0," + (this.pitch * this.bankSizeRatio * this.bankSizeRatioFactor) + ")");
        if (this.slipSkid)
            diffAndSetAttribute(this.slipSkid, "transform", "rotate(" + this.bank + ", 0, 0) translate(" + (this.slipSkidValue * 40) + ", 0)");
        if (this.slipSkidTriangle)
            diffAndSetAttribute(this.slipSkidTriangle, "transform", "rotate(" + this.bank + ", 0, 0)");
        if (this.horizonTop) {
            if (this.backgroundVisible) {
                diffAndSetAttribute(this.horizonTop, "fill", this.horizonTopColor);
                diffAndSetAttribute(this.horizonBottom, "fill", this.horizonBottomColor);
            }
            else {
                diffAndSetAttribute(this.horizonTop, "fill", "transparent");
                diffAndSetAttribute(this.horizonBottom, "fill", "transparent");
            }
        }
    }
}
customElements.define('a320-neo-sai-attitude-indicator', A320_Neo_SAI_AttitudeIndicator);
registerInstrument("a320-neo-sai", A320_Neo_SAI);
//# sourceMappingURL=A320_Neo_SAI.js.map