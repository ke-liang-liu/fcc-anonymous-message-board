const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
const days = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];
var addFirstZero = function (num) {
  let str = num.toString();
  return (str.length === 1) ? '0' + str : str;
}
var formatDate = function (dateStr) {
  let d = new Date(dateStr);  
  const year = d.getFullYear();
  const date = d.getDate();
  const monthName = months[d.getMonth()];
  const dayName = days[d.getDay()]
  const hours = addFirstZero(d.getHours());
  const min = addFirstZero(d.getMinutes());
  const sec = addFirstZero(d.getSeconds());
  return `${dayName}, ${date} ${monthName} ${year}, ${hours}:${min}:${sec}`;
}
