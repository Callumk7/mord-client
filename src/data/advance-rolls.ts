export const advanceRolls = [
	{
		type: "heroes",
		rolls: [
			{
				roll: [2, 5],
				result: "New Skill",
				description:
					"Select one of the skills tables available to the hero and pick a skill. If he is a wizard he may choose to randomly generate a new spell",
			},
			{
				roll: 6,
				result: "Characteristic Increase",
				description: "Roll again: 1-3: +1 Strength. 4-6: +1 Attack",
			},
			{
				roll: 7,
				result: "Characteristic Increase",
				description: "Choose either +1 BS or +1 WS",
			},
			{
				roll: 8,
				result: "Characteristic Increase",
				description: "Roll again: 1-3: +1 Initiative. 4-6: +1 Leadership",
			},
			{
				roll: 9,
				result: "Characteristic Increase",
				description: "Roll again: 1-3: +1 Wound. 4-6: +1 Toughness",
			},
			{
				roll: [10, 12],
				result: "New Skill",
				description:
					"Select one of the skills tables available to the hero and pick a skill. If he is a wizard he may choose to randomly generate a new spell",
			},
		],
	},
	{
		type: "henchmen",
		rolls: [
			{
				roll: [2, 4],
				result: "+1 Initiative",
			},
			{
				roll: 5,
				result: "+1 Strength",
			},
			{
				roll: [6, 7],
				result: "Choose either +1 BS or +1 WS",
			},
			{
				roll: 8,
				result: "+1 Attack",
			},
			{
				roll: 9,
				result: "+1 Leadership",
			},
			{
				roll: [10, 12],
				result: "Lads got talent",
			},
		],
	},
];
