export type Promotion = {
	_id: string;
	promotionTitle: string;
	promotionDescription: string;
    promotionImage: string;
	promotionType: 'discount' | 'offer'|'upgrade' | 'permanent';
	promotionValue: number;
	minimumRentals: number;
	minimumMoneySpent: number;
	promotionStartDate: string;
	promotionEndDate: string;
	status: 'active' | 'inactive' | 'expired' | 'scheduled';
    goldenMembersOnly: boolean;
    target: 'all' | 'specific' | 'none';
    specificTarget: string[];
};