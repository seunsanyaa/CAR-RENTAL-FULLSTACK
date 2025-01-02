export type Promotion = {
	_id: string;
	promotionTitle: string;
	promotionDescription: string;
    promotionImage: string;
	promotionType: 'discount' | 'permenant' | 'reward_points';
	promotionValue: number;
	promotionStartDate: string;
	promotionEndDate: string;
	status: 'active' | 'inactive' | 'expired' | 'scheduled';
    goldenMembersOnly: boolean;
    target: 'all' | 'specific' | 'none';
    specificTarget: string[];
	minimumRentals: number;
	minimumMoneySpent: number;
};