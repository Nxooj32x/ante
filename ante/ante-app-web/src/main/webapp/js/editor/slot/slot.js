define('editor/slot/slot', function (require, exports, module) {

    var imageSlot = require("editor/slot/imageSlot");
    var textSlot = require("editor/slot/textSlot");
    var decorationSlot = require("editor/slot/decorationSlot");
    var shadingSlot = require("editor/slot/shadingSlot");
    var shapeSlot = require("editor/slot/shapeSlot");

    var defaultSlot = require("editor/slot/defaultSlot");

    var _slotMaps = {
        imageslot : imageSlot,
        textslot : textSlot,
        decorationslot : decorationSlot,
        shadingslot : shadingSlot,
        shapeslot : shapeSlot,

        default : defaultSlot
    };

    function isImageSlot(el) {
        return el === "imageslot" || $(el).is('imageslot') || $(el).hasClass('imageslot');
    }

    function isTextSlot(el) {
        return el === "textslot" || $(el).is('textslot') || $(el).hasClass('textslot');
    }

    function isDecorationSlot(el) {
        return el === "decorationslot" || $(el).is('decorationslot') || $(el).hasClass('decorationslot');
    }

    function isShadingSlot(el) {
        return el === "shadingslot" || $(el).is('shadingslot') || $(el).hasClass('shadingslot');
    }

    function isShapeSlot(el) {
        return el === "shapeslot" || $(el).is('shapeslot') || $(el).hasClass('shapeslot');
    }

    function getImageSlotName() {
        return "imageslot";
    }

    function getTextSlotName() {
        return "textslot";
    }

    function getDecorationSlotName() {
        return "decorationslot";
    }

    function getShadingSlotName() {
        return "shadingslot";
    }

    function getShapeSlotName() {
        return "shapeslot";
    }

    function getAllSlotClass() {
        return ".textslot,.imageslot,.decorationslot,.shadingslot,.shapeslot";
    }

    function judgeSlotType(el) {
        if (isImageSlot(el)) {
            return getImageSlotName();
        } else if (isTextSlot(el)) {
            return getTextSlotName();
        } else  if (isDecorationSlot(el)) {
            return getDecorationSlotName();
        } else if (isShadingSlot(el)) {
            return getShadingSlotName();
        } else if (isShapeSlot(el)) {
            return getShapeSlotName();
        } else {
            return "default";
        }
    }

    function template(el) {
        var slot =  _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.template();
    }

    function getAttr(el) {
        var slot =  _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.getAttr(el);
    }

    function setAttr(el, attr) {
        var slot =  _slotMaps[judgeSlotType(el)];
        if (isLocked(el)) {
            if (attr.locked !== undefined){
                if (slot != null)
                    return slot.setAttr(el, attr);
            } else {
                SureMsg.error("请先解锁槽位!");
            }
        } else {
            if (slot != null)
                return slot.setAttr(el, attr);
        }
    }

    function create(type, info, args) {
        var slot =  _slotMaps[judgeSlotType(type)];
        if (slot != null)
            return slot.create(info, args);
    }

    function isEmpty(el) {
        var slot = _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.isEmpty(el);
    }

    function isLocked(el) {
        var slot = _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.isLocked(el);
    }

    exports.template = template;
    exports.getAttr = getAttr;
    exports.setAttr = setAttr;
    exports.create = create;
    exports.isEmpty = isEmpty;
    exports.isLocked = isLocked;

    exports.slotType = judgeSlotType;
    exports.isImageSlot = isImageSlot;
    exports.isTextSlot = isTextSlot;
    exports.isDecorationSlot = isDecorationSlot;
    exports.isShadingSlot = isShadingSlot;
    exports.isShapeSlot = isShapeSlot;

    exports.getImageSlotName = getImageSlotName;
    exports.getTextSlotName = getTextSlotName;
    exports.getDecorationSlotName = getDecorationSlotName;
    exports.getShadingSlotName = getShadingSlotName;
    exports.getShapeSlotName = getShapeSlotName;

    exports.getAllSlotClass = getAllSlotClass;


    exports.image = imageSlot;
    exports.text = textSlot;
    exports.decoration = decorationSlot;
    exports.shading = shadingSlot;
    exports.shape = shapeSlot;

});