import CommonService from "./commonService"

export default class Templates {
    commonSvc;
    
    constructor()
    {       
        this.commonSvc = new CommonService();
    }    
    
    /* message types */
    FateCore = {        
        skills: [
            {label: "Superb", value:"+5", obj:"skills.superb",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Great", value:"+4", obj:"skills.great",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Good", value:"+3", obj:"skills.good",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Fair", value:"+2", obj:"skills.fair",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Average", value:"+1", obj:"skills.average",  items:["s1", "s2", "s3", "s4", "s5"] }			
        ],
        aspects: [
            {label:"High Concept", obj:"aspects.highconcept"},
            {label:"Trouble", obj:"aspects.trouble"},
            {label:"Aspect", obj:"aspects.other1"},
            {label:"Aspect", obj:"aspects.other2"},
            {label:"Aspect", obj:"aspects.other3"},
        ],
        consequences: [
            {label:"Mild", obj:"consequences.mild", value: "2"},
            {label:"Moderate", obj:"consequences.moderate", value: "4"},
            {label:"Severe", obj:"consequences.severe", value: "6"},
            {label:"Mild", obj:"consequences.mild2", value: "2", requirement: {obj:"physique|will", val:"5" }},
        ],
        physicalstress: [
            {label:"1", obj:"stress1"},
            {label:"2", obj:"stress2"},
            {label:"3", obj:"stress3", requirement: {obj:"physique", val:"1" }},
            {label:"4", obj:"stress4", requirement: {obj:"physique", val:"3" }},						
        ],
        mentalstress: [
            {label:"1", obj:"mental1"},
            {label:"2", obj:"mental2"},
            {label:"3", obj:"mental3", requirement: {obj:"will", val:"1" }},
            {label:"4", obj:"mental4", requirement: {obj:"will", val:"3" }},						
        ],     
    }
    

    FateAccelerated = {        
        approaches:  [
            {placeholder:"Careful", obj:"approaches.careful"},
            {placeholder:"Clever", obj:"approaches.clever"},
            {placeholder:"Flashy", obj:"approaches.flashy"},
            {placeholder:"Forceful", obj:"approaches.forceful"},
            {placeholder:"Quick", obj:"approaches.quick"},
            {placeholder:"Sneaky", obj:"approaches.sneaky"},
        ],
        aspects: [
            {label:"High Concept", obj:"aspects.highconcept"},
            {label:"Trouble", obj:"aspects.trouble"},
            {label:"Aspect", obj:"aspects.other1"},
            {label:"Aspect", obj:"aspects.other2"},
            {label:"Aspect", obj:"aspects.other3"},			
        ],
        consequences: [
            {label:"Mild", obj:"consequences.mild", value: "2"},
            {label:"Moderate", obj:"consequences.moderate", value: "4"},
            {label:"Severe", obj:"consequences.severe", value: "6"},
        ],
        stresses: [
            {label:"1", obj:"stress.stress1"},
            {label:"2", obj:"stress.stress2"},
            {label:"3", obj:"stress.stress3"},
        ]       
    }

    FateCondensed = {
        skills:  [
            {placeholder:"ACADEMICS", obj:"skills.skill1", label:"skills.label1"},
            {placeholder:"ATHLETICS", obj:"skills.skill2", label:"skills.label2"},
            {placeholder:"BURGLARY", obj:"skills.skill3", label:"skills.label3"},
            {placeholder:"CONTACTS", obj:"skills.skill4", label:"skills.label4"},
            {placeholder:"CRAFTS", obj:"skills.skill5", label:"skills.label5"},
            {placeholder:"DECEIVE", obj:"skills.skill6", label:"skills.label6"},
            {placeholder:"DRIVE", obj:"skills.skill7", label:"skills.label7"},
            {placeholder:"EMPATHY", obj:"skills.skill8", label:"skills.label8"},
            {placeholder:"FIGHT", obj:"skills.skill9", label:"skills.label9"},
            {placeholder:"INVESTIGATE", obj:"skills.skill10", label:"skills.label10"},
            {placeholder:"LORE", obj:"skills.skill11", label:"skills.label11"},
            {placeholder:"NOTICE", obj:"skills.skill12", label:"skills.label12"},
            {placeholder:"PHYSIQUE", obj:"skills.skill13", label:"skills.label13"},
            {placeholder:"PROVOKE", obj:"skills.skill14", label:"skills.label14"},
            {placeholder:"RAPPORT", obj:"skills.skill15", label:"skills.label15"},
            {placeholder:"RESOURCES", obj:"skills.skill16", label:"skills.label16"},
            {placeholder:"SHOOT", obj:"skills.skill17", label:"skills.label17"},
            {placeholder:"STEALTH", obj:"skills.skill18", label:"skills.label18"},
            {placeholder:"WILL", obj:"skills.skill19", label:"skills.label19"},			
        ],
        aspects: [
            {label:"High Concept", obj:"aspects.highconcept"},
            {label:"Trouble", obj:"aspects.trouble"},
            {label:"Relationship", obj:"aspects.relationship"},
            {label:"Aspect", obj:"aspects.other1"},
            {label:"Aspect", obj:"aspects.other2"},			
        ],
        consequences: [
            {label:"Mild", obj:"consequences.mild", value: "2"},
            {label:"Moderate", obj:"consequences.moderate", value: "4"},
            {label:"Severe", obj:"consequences.severe", value: "6"},
            {label:"Mild", obj:"consequences.mild2", value: "2", requirement: {obj:"skill13|skill19", val:"5" } },
        ],
        physicalstress: [
            {label:"1", obj:"stress1"},
            {label:"1", obj:"stress2"},
            {label:"1", obj:"stress3"},
            {label:"1", obj:"stress4", requirement: {obj:"skill13", val:"1" }},
            {label:"1", obj:"stress5", requirement: {obj:"skill13", val:"3" }},
            {label:"1", obj:"stress6", requirement: {obj:"skill13", val:"3" }},
        ],
        mentalstress: [
            {label:"1", obj:"mental1"},
            {label:"1", obj:"mental2"},
            {label:"1", obj:"mental3"},
            {label:"1", obj:"mental4", requirement: {obj:"skill19", val:"1" }},
            {label:"1", obj:"mental5", requirement: {obj:"skill19", val:"3" }},
            {label:"1", obj:"mental6", requirement: {obj:"skill19", val:"3" }},						
        ],  
    }

    FateAnything = {
        skills:  [
            {id: 1, placeholder:"ACADEMICS", obj:"skills.skill1", label:"skills.label1"},
            {id: 2, placeholder:"ATHLETICS", obj:"skills.skill2", label:"skills.label2"},
            {id: 3, placeholder:"BURGLARY", obj:"skills.skill3", label:"skills.label3"},
            {id: 4, placeholder:"CONTACTS", obj:"skills.skill4", label:"skills.label4"},
            {id: 5, placeholder:"CRAFTS", obj:"skills.skill5", label:"skills.label5"},
            {id: 6, placeholder:"DECEIVE", obj:"skills.skill6", label:"skills.label6"},
            {id: 7, placeholder:"DRIVE", obj:"skills.skill7", label:"skills.label7"},
            {id: 8, placeholder:"EMPATHY", obj:"skills.skill8", label:"skills.label8"},
            {id: 9, placeholder:"FIGHT", obj:"skills.skill9", label:"skills.label9"},
            {id: 10, placeholder:"INVESTIGATE", obj:"skills.skill10", label:"skills.label10"},
            {id: 11, placeholder:"LORE", obj:"skills.skill11", label:"skills.label11"},
            {id: 12, placeholder:"NOTICE", obj:"skills.skill12", label:"skills.label12"},
            {id: 13, placeholder:"PHYSIQUE", obj:"skills.skill13", label:"skills.label13"},
            {id: 14, placeholder:"PROVOKE", obj:"skills.skill14", label:"skills.label14"},
            {id: 15, placeholder:"RAPPORT", obj:"skills.skill15", label:"skills.label15"},
            {id: 16, placeholder:"RESOURCES", obj:"skills.skill16", label:"skills.label16"},
            {id: 17, placeholder:"SHOOT", obj:"skills.skill17", label:"skills.label17"},
            {id: 18, placeholder:"STEALTH", obj:"skills.skill18", label:"skills.label18"},
            {id: 19, placeholder:"WILL", obj:"skills.skill19", label:"skills.label19"}			
        ],
        aspects: [
            {id: 1, label:"aspects.label1", obj:"aspects.aspect1", placeholder:"High Concept"},
            {id: 2, label:"aspects.label2", obj:"aspects.aspect2", placeholder:"Trouble"},
            {id: 3, label:"aspects.label3", obj:"aspects.aspect3", placeholder:"Relationship"},
            {id: 4, label:"aspects.label4", obj:"aspects.aspect4", placeholder:"Aspect"},
            {id: 5, label:"aspects.label5", obj:"aspects.aspect5", placeholder:"Aspect"},		
        ],
        consequences: [
            {id: 1, label:"consequences.label1", obj:"consequences.consequence1", value:"consequences.value1", placeholder:"Mild", valueplaceholder:"2"},
            {id: 2, label:"consequences.label2", obj:"consequences.consequence2", value:"consequences.value2", placeholder:"Moderate", valueplaceholder:"3"},
            {id: 3, label:"consequences.label3", obj:"consequences.consequence3", value:"consequences.value3", placeholder:"Severe", valueplaceholder:"4"},
        ],
        stress: [
            {
                id: 1,
                label: "stress.stress1.label",
                placeholder: "Physical",
                boxes: [
                    {id: 1, label:"stress.stress1.boxes.label1", obj:"stress.stress1.boxes.stress1", placeholder: "1"},
                    {id: 2, label:"stress.stress1.boxes.label2", obj:"stress.stress1.boxes.stress2", placeholder: "2"},
                    {id: 3, label:"stress.stress1.boxes.label3", obj:"stress.stress1.boxes.stress3", placeholder: "3"},
                ]
            },
            {
                id: 2,
                label: "stress.stress2.label",
                placeholder: "Mental",
                boxes: [
                    {id: 1, label:"stress.stress2.boxes.label1", obj:"stress.stress2.boxes.stress1", placeholder: "1"},
                    {id: 2, label:"stress.stress2.boxes.label2", obj:"stress.stress2.boxes.stress2", placeholder: "2"},
                    {id: 3, label:"stress.stress2.boxes.label3", obj:"stress.stress2.boxes.stress3", placeholder: "3"},
                ]
            }
        ] 		
    }

}