import { FontAwesomeIcon } 
    from "@fortawesome/vue-fontawesome";
import { library } 
    from "@fortawesome/fontawesome-svg-core";
import { 
    faPhone, faUser, faFlag, faMagnifyingGlass, faMask, faWandMagicSparkles, faHouse, faBuildingShield, 
    faPersonWalking, faMagnifyingGlassArrowRight, faCirclePlus, faCircleMinus, faCheck, faChartColumn, 
    faExpand, faFileImport, faLock, faLeftLong, faRightLong, faGear, faFileExport, faList, faFileArrowDown,
    faCodeCompare, faChevronUp, faChevronRight } 
    from "@fortawesome/free-solid-svg-icons";
import { faJs, faVuejs, faDiscord, faThreads } 
    from "@fortawesome/free-brands-svg-icons";
import { faCircleDown, faEye, faFloppyDisk, faTrashCan, faImage} 
    from "@fortawesome/free-regular-svg-icons";

library.add(faPhone, faUser, faFlag, faJs, faVuejs, faDiscord, faMagnifyingGlass, faCircleDown, 
    faMask, faWandMagicSparkles, faHouse, faBuildingShield, faPersonWalking, faFileExport, faList,
    faMagnifyingGlassArrowRight, faCirclePlus, faCircleMinus, faCheck, faEye, faFloppyDisk, 
    faTrashCan, faChartColumn, faExpand, faFileImport, faLock, faLeftLong, faRightLong, faGear,
    faFileArrowDown, faImage, faCodeCompare, faChevronUp, faChevronRight, faThreads
);

export default FontAwesomeIcon;
