var A320_Neo_RadioManagement;
(function (A320_Neo_RadioManagement) {
    let FREQUENCY_TYPE;
    (function (FREQUENCY_TYPE) {
        FREQUENCY_TYPE[FREQUENCY_TYPE["NONE"] = -1] = "NONE";
        FREQUENCY_TYPE[FREQUENCY_TYPE["VHF1"] = 0] = "VHF1";
        FREQUENCY_TYPE[FREQUENCY_TYPE["VHF2"] = 1] = "VHF2";
        FREQUENCY_TYPE[FREQUENCY_TYPE["VHF3"] = 2] = "VHF3";
        FREQUENCY_TYPE[FREQUENCY_TYPE["HF1"] = 3] = "HF1";
        FREQUENCY_TYPE[FREQUENCY_TYPE["HF2"] = 4] = "HF2";
        FREQUENCY_TYPE[FREQUENCY_TYPE["VOR"] = 5] = "VOR";
        FREQUENCY_TYPE[FREQUENCY_TYPE["ILS"] = 6] = "ILS";
        FREQUENCY_TYPE[FREQUENCY_TYPE["ADF"] = 7] = "ADF";
        FREQUENCY_TYPE[FREQUENCY_TYPE["NB"] = 8] = "NB";
    })(FREQUENCY_TYPE = A320_Neo_RadioManagement.FREQUENCY_TYPE || (A320_Neo_RadioManagement.FREQUENCY_TYPE = {}));
    function IsNAVFrequencyType(_type) {
        switch (_type) {
            case FREQUENCY_TYPE.VOR:
            case FREQUENCY_TYPE.ILS:
            case FREQUENCY_TYPE.ADF:
                {
                    return true;
                }
            default:
                {
                    return false;
                }
        }
    }
    A320_Neo_RadioManagement.IsNAVFrequencyType = IsNAVFrequencyType;
})(A320_Neo_RadioManagement || (A320_Neo_RadioManagement = {}));
class A320_Neo_FDW_FrequencyHandler {
    constructor(_index, _xmlRef, _radioNav, _min, _max, _decimalMod, _integerMod, _dp, _useCRSMode = false, _use833Hz = false) {
        this.index = 0;
        this.min = 0;
        this.max = 0;
        this.decimalMod = 0;
        this.integerMod = 0;
        this.displayDP = 0;
        this.active = 0;
        this.stby = 0;
        this.needRefresh = false;
        this.useCRSMode = false;
        this.activeCRSMode = false;
        this.crs = 0;
        this.getActiveSimVar = null;
        this.setActiveSimVar = null;
        this.getStbySimVar = null;
        this.setStbySimVar = null;
        this.getCrsSimVar = null;
        this.setCrsSimVar = null;
        this.autoRefreshTimer = 5.0;
        this.disableAutoRefreshTimer = 0.0;
        this.index = _index;
        this.xmlRef = _xmlRef;
        this.radioNav = _radioNav;
        this.min = _min;
        this.max = _max;
        this.decimalMod = _decimalMod;
        this.integerMod = _integerMod;
        this.displayDP = _dp;
        this.useCRSMode = _useCRSMode;
        this.use833Hz = _use833Hz;
        this.active = this.min;
        this.stby = this.min;
    }
    linkActiveToSimVars(_get, _set) {
        this.getActiveSimVar = _get.bind(this.radioNav);
        this.setActiveSimVar = _set.bind(this.radioNav);
    }
    linkStbyToSimVars(_get, _set) {
        this.getStbySimVar = _get.bind(this.radioNav);
        this.setStbySimVar = _set.bind(this.radioNav);
    }
    linkCrsToSimVars(_get, _set) {
        this.getCrsSimVar = _get.bind(this.radioNav);
        this.setCrsSimVar = _set.bind(this.radioNav);
    }
    hasXMLRef(_xmlRef) {
        return (_xmlRef == this.xmlRef);
    }
    update(_deltaTime, _activeText, _stbyText) {
        this.disableAutoRefreshTimer -= _deltaTime;
        if (this.disableAutoRefreshTimer <= 0.0) {
            this.disableAutoRefreshTimer = 0.0;
            this.autoRefreshTimer -= _deltaTime;
            if (this.autoRefreshTimer <= 0.0) {
                this.setFromSimvars();
                this.autoRefreshTimer = 5.0;
            }
        }
        if (this.needRefresh) {
            if (_activeText != null) {
                diffAndSetText(_activeText, fastToFixed(this.active, this.displayDP));
            }
            if (_stbyText != null) {
                if (this.activeCRSMode) {
                    diffAndSetText(_stbyText, "C-" + (this.crs + '').padStart(3, "0"));
                }
                else {
                    diffAndSetText(_stbyText, fastToFixed(this.stby, this.displayDP));
                }
            }
            this.needRefresh = false;
        }
    }
    show() {
        this.setFromSimvars();
    }
    setFromSimvars() {
        if (this.getActiveSimVar != null) {
            this.active = this.getActiveSimVar(this.index);
            let validVal = Utils.Clamp(this.active, this.min, this.max);
            let changed = (validVal != this.active) ? true : false;
            this.active = validVal;
            if (changed)
                this.setActiveValueSimVar();
        }
        if (this.getStbySimVar != null) {
            this.stby = this.getStbySimVar(this.index);
            let validVal = Utils.Clamp(this.stby, this.min, this.max);
            let changed = (validVal != this.stby) ? true : false;
            this.stby = validVal;
            if (changed)
                this.setStbyValueSimVar();
        }
        if (this.useCRSMode) {
            this.crs = this.getCrsSimVar(this.index);
        }
        this.needRefresh = true;
    }
    transfer() {
        if (this.activeCRSMode) {
            this.setCrsValueSimVar();
            this.activeCRSMode = false;
        }
        else {
            var temp = this.active;
            this.active = this.stby;
            this.stby = temp;
            this.setActiveValueSimVar();
            this.setStbyValueSimVar();
            if (this.useCRSMode) {
                this.activeCRSMode = true;
            }
        }
        this.needRefresh = true;
    }
    decimalINC() {
        if (this.activeCRSMode) {
            this.modifyTargetCRSValue(1);
        }
        else {
            let newValue = parseFloat(fastToFixed((this.stby + this.decimalMod), this.displayDP));
            if (Math.trunc(newValue) > Math.trunc(this.stby)) {
                newValue -= 1;
            }
            if (this.use833Hz && !RadioNav.isHz833Compliant(newValue)) {
                newValue = parseFloat(fastToFixed((newValue + this.decimalMod), this.displayDP));
                if (Math.trunc(newValue) > Math.trunc(this.stby)) {
                    newValue -= 1;
                }
            }
            this.trySetStbyValue(newValue);
        }
    }
    decimalDEC() {
        if (this.activeCRSMode) {
            this.modifyTargetCRSValue(-1);
        }
        else {
            let newValue = parseFloat(fastToFixed((this.stby - this.decimalMod), this.displayDP));
            if (Math.trunc(newValue) < Math.trunc(this.stby)) {
                newValue += 1;
            }
            if (this.use833Hz && !RadioNav.isHz833Compliant(newValue)) {
                newValue = parseFloat(fastToFixed((newValue - this.decimalMod), this.displayDP));
                if (Math.trunc(newValue) < Math.trunc(this.stby)) {
                    newValue += 1;
                }
            }
            this.trySetStbyValue(newValue);
        }
    }
    integerINC() {
        if (this.activeCRSMode) {
            this.modifyTargetCRSValue(10);
        }
        else {
            this.trySetStbyValue(this.stby + this.integerMod);
        }
    }
    integerDEC() {
        if (this.activeCRSMode) {
            this.modifyTargetCRSValue(-10);
        }
        else {
            this.trySetStbyValue(this.stby - this.integerMod);
        }
    }
    trySetStbyValue(_value) {
        var newValue = Utils.Clamp(_value, this.min, this.max);
        if (newValue != this.stby) {
            this.stby = newValue;
            this.setStbyValueSimVar();
            this.needRefresh = true;
            this.disableAutoRefreshTimer = 5.0;
        }
    }
    modifyTargetCRSValue(_value) {
        this.crs += _value;
        if (this.crs < 0) {
            this.crs += 360;
        }
        else if (this.crs > 360) {
            this.crs -= 360;
        }
        this.setCrsValueSimVar();
        this.needRefresh = true;
        this.disableAutoRefreshTimer = 5.0;
    }
    setActiveValueSimVar() {
        if (this.setActiveSimVar != null) {
            this.setActiveSimVar(this.index, this.active);
        }
    }
    setStbyValueSimVar() {
        if (this.setStbySimVar != null) {
            this.setStbySimVar(this.index, this.stby);
        }
    }
    setCrsValueSimVar() {
        if (this.setCrsSimVar != null) {
            this.setCrsSimVar(this.index, this.crs);
        }
    }
}
class A320_Neo_FDW extends BaseAirliners {
    constructor() {
        super();
        this.side = "L";
        this.navIndex = 0;
        this.onVarName = "";
        this.onSwitchEventName = "";
        this.transferEventName = "";
        this.navButtonEventName = "";
        this.decimalIncEventName = "";
        this.decimalDecEventName = "";
        this.integerIncEventName = "";
        this.integerDecEventName = "";
        this.buttonEventNamePrefix = "";
        this.currentFrequencyType = A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE;
        this.lastNonNavFrequencyType = A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE;
        this.isNavModeActive = false;
        this.valueTexts = [null, null];
        this.frequencyHandlers = new Array(A320_Neo_RadioManagement.FREQUENCY_TYPE.NB);
        this.navIndex = (this.side == "L") ? 1 : 2;
        this.onVarName = "L:XMLVAR_RMP_" + this.side + "_On";
        this.onSwitchEventName = "SWITCH_" + this.side + "_TOGGLE";
        this.transferEventName = "BTN_" + this.side + "_TRANSFER";
        this.navButtonEventName = "BTN_" + this.side + "_NAV";
        this.integerIncEventName = "DIAL_" + this.side + "_INTEGER_INC";
        this.integerDecEventName = "DIAL_" + this.side + "_INTEGER_DEC";
        this.decimalIncEventName = "DIAL_" + this.side + "_DECIMAL_INC";
        this.decimalDecEventName = "DIAL_" + this.side + "_DECIMAL_DEC";
        this.buttonEventNamePrefix = "BTN_" + this.side + "_";
    }
    get templateID() { return "A320_Neo_FDW"; }
    connectedCallback() {
        super.connectedCallback();
        this.valueTexts[0] = this.querySelector("#ActiveValue");
        this.valueTexts[1] = this.querySelector("#StbyCrsValue");
        if (this.valueTexts[0] != null) {
            diffAndSetText(this.valueTexts[0], "");
        }
        if (this.valueTexts[1] != null) {
            diffAndSetText(this.valueTexts[1], "");
        }
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF1] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "VHF1", this.radioNav, 118, 136.9, 0.005, 1, 3, false, true);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF1].linkActiveToSimVars(this.radioNav.getVHF1ActiveFrequency, this.radioNav.setVHF1ActiveFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF1].linkStbyToSimVars(this.radioNav.getVHF1StandbyFrequency, this.radioNav.setVHF1StandbyFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF2] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "VHF2", this.radioNav, 118, 136.9, 0.005, 1, 3, false, true);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF2].linkActiveToSimVars(this.radioNav.getVHF2ActiveFrequency, this.radioNav.setVHF2ActiveFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF2].linkStbyToSimVars(this.radioNav.getVHF2StandbyFrequency, this.radioNav.setVHF2StandbyFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF3] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "VHF3", this.radioNav, 118, 136.9, 0.005, 1, 3, false, true);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF3].linkActiveToSimVars(this.radioNav.getVHF3ActiveFrequency, this.radioNav.setVHF3ActiveFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF3].linkStbyToSimVars(this.radioNav.getVHF3StandbyFrequency, this.radioNav.setVHF3StandbyFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.HF1] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "HF1", this.radioNav, 2.8, 28, 0.01, 1, 3);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.HF2] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "HF2", this.radioNav, 2.8, 28, 0.01, 1, 3);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VOR] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "VOR", this.radioNav, 108, 117.95, 0.05, 1, 2, true);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VOR].linkActiveToSimVars(this.radioNav.getVORActiveFrequency, this.radioNav.setVORActiveFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VOR].linkStbyToSimVars(this.radioNav.getVORStandbyFrequency, this.radioNav.setVORStandbyFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.VOR].linkCrsToSimVars(this.radioNav.getVORObs, this.radioNav.setVORObs);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.ILS] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "ILS", this.radioNav, 108, 117.95, 0.05, 1, 2, true);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.ILS].linkActiveToSimVars(this.radioNav.getILSActiveFrequency, this.radioNav.setILSActiveFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.ILS].linkStbyToSimVars(this.radioNav.getILSStandbyFrequency, this.radioNav.setILSStandbyFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.ILS].linkCrsToSimVars(this.radioNav.getILSObs, this.radioNav.setILSObs);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.ADF] = new A320_Neo_FDW_FrequencyHandler(this.navIndex, "ADF", this.radioNav, 190, 1750, 0.5, 1, 2);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.ADF].linkActiveToSimVars(this.radioNav.getADFActiveFrequency, this.radioNav.setADFActiveFrequency);
        this.frequencyHandlers[A320_Neo_RadioManagement.FREQUENCY_TYPE.ADF].linkStbyToSimVars(this.radioNav.getADFStandbyFrequency, this.radioNav.setADFStandbyFrequency);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        var isOn = SimVar.GetSimVarValue(this.onVarName, "Boolean");
        if (isOn && (this.currentFrequencyType == A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE)) {
            this.switchOn();
        }
        else if (!isOn && (this.currentFrequencyType != A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE)) {
            this.switchOff();
        }
        if (isOn) {
            this.frequencyHandlers[this.currentFrequencyType].update(this.deltaTime, this.valueTexts[0], this.valueTexts[1]);
        }
    }
    switchOn() {
        this.currentFrequencyType = A320_Neo_RadioManagement.FREQUENCY_TYPE.VHF1;
        this.frequencyHandlers[this.currentFrequencyType].show();
        this.lastNonNavFrequencyType = this.currentFrequencyType;
        this.switchNavActive(false);
    }
    switchOff() {
        this.currentFrequencyType = A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE;
        this.lastNonNavFrequencyType = this.currentFrequencyType;
        this.switchNavActive(false);
        if (this.valueTexts[0] != null) {
            diffAndSetText(this.valueTexts[0], "");
        }
        if (this.valueTexts[1] != null) {
            diffAndSetText(this.valueTexts[1], "");
        }
    }
    switchNavActive(_val) {
        this.isNavModeActive = _val;
        this.radioNav.setRADIONAVActive(this.navIndex, _val);
        if (!_val)
            this.radioNav.setRADIONAVSource(NavSource.AUTO);
    }
    onEvent(_event) {
        if (_event == this.transferEventName) {
            if (this.currentFrequencyType > A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE) {
                this.frequencyHandlers[this.currentFrequencyType].transfer();
            }
        }
        else if (_event == this.navButtonEventName) {
            if (this.isNavModeActive) {
                if (this.lastNonNavFrequencyType > A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE) {
                    this.currentFrequencyType = this.lastNonNavFrequencyType;
                    this.frequencyHandlers[this.currentFrequencyType].show();
                    if (this.currentFrequencyType == A320_Neo_RadioManagement.FREQUENCY_TYPE.VOR)
                        this.radioNav.setRADIONAVSource(NavSource.VOR1);
                    else if (this.currentFrequencyType == A320_Neo_RadioManagement.FREQUENCY_TYPE.ILS)
                        this.radioNav.setRADIONAVSource(NavSource.ILS1);
                    else
                        this.radioNav.setRADIONAVSource(NavSource.AUTO);
                }
            }
            this.switchNavActive(!this.isNavModeActive);
        }
        else if (_event == this.decimalIncEventName) {
            if (this.currentFrequencyType > A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE) {
                this.frequencyHandlers[this.currentFrequencyType].decimalINC();
            }
        }
        else if (_event == this.decimalDecEventName) {
            if (this.currentFrequencyType > A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE) {
                this.frequencyHandlers[this.currentFrequencyType].decimalDEC();
            }
        }
        else if (_event == this.integerIncEventName) {
            if (this.currentFrequencyType > A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE) {
                this.frequencyHandlers[this.currentFrequencyType].integerINC();
            }
        }
        else if (_event == this.integerDecEventName) {
            if (this.currentFrequencyType > A320_Neo_RadioManagement.FREQUENCY_TYPE.NONE) {
                this.frequencyHandlers[this.currentFrequencyType].integerDEC();
            }
        }
        else {
            if (_event.indexOf(this.buttonEventNamePrefix) >= 0) {
                var xmlRef = _event.replace(this.buttonEventNamePrefix, "");
                for (var frequencyType = 0; frequencyType < A320_Neo_RadioManagement.FREQUENCY_TYPE.NB; ++frequencyType) {
                    if (this.frequencyHandlers[frequencyType].hasXMLRef(xmlRef)) {
                        this.currentFrequencyType = frequencyType;
                        this.frequencyHandlers[frequencyType].show();
                        if (!A320_Neo_RadioManagement.IsNAVFrequencyType(frequencyType)) {
                            this.lastNonNavFrequencyType = frequencyType;
                        }
                        break;
                    }
                }
            }
        }
    }
}
registerInstrument("a320-neo-fdw", A320_Neo_FDW);
//# sourceMappingURL=A320_Neo_FDW.js.map