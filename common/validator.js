export const validator = {
	PhoneNum(value) {
        return /^1[23456789]\d{9}$/.test(value);
	},
    Email(value) {
        return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(value);
    },
    IDCard(value) {
        let reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
        return reg.test(value)
    },
    NewDate(value) {
        return !/Invalid|NaN/.test(new Date(value).toString());
    },
    Money(value) {
        return /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value);
    },
    NumberIsTen(value) {
        return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
    }
}