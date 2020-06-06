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

/* generate HTML for one thread*/
var oneThreadHtml = function(ele, currentBoard, i) {
  // console.log(ele);//can I use typeScript please?!
  let pathname = window.location.pathname;
  pathname = (pathname.slice(-1)==='/') ? pathname : pathname + '/';
  var thread = ['<div class="thread">'];
  thread.push('<div class="main">')
  thread.push(`<form id="reportThread${i}" style="display:inline">`);
  thread.push('<input type="hidden" name="thread_id" value="'+ele._id+'">');
  thread.push(`<input type="hidden" id="report_value${i}" name="report_value" value="${ele.reported}">`);
  thread.push(`<button id="reportThreadBtn${i}" title=${ele.reported? "Starred" : "Unstarred"} style="width:35px;height:22px">${ele.reported? "&#11088;" : "&#9734;"}</button>`);
  thread.push('</form>');
  thread.push('&nbsp;<p class="id" style="display:inline"><b>Thread id</b>: '+ele._id+' ('+   formatDate(ele.created_on)  +')</p>&nbsp;');
  thread.push('<form id="deleteThread" style="display:inline"><input type="hidden" value="'+ele._id+'" name="thread_id" required=""><input type="text" placeholder="password" size="8" name="delete_password" required="">&nbsp;<input type="submit" value="Delete thread"></form>');
  thread.push('<h3>'+ele.text+'</h3>');
  thread.push('</div><div class="replies">');
  var hiddenCount = ele.replycount - 3;
  if (hiddenCount < 1) { hiddenCount = 0 };
  thread.push('<h5>'+ele.replycount+' replies total');
  if (i !== undefined) {
    thread.push(`(${hiddenCount} hidden) - <a href="${pathname}${ele._id}">See the full thread here</a>`);
  }
  thread.push(`</h5>`);
  ele.replies.forEach(function(rep, j) {
    thread.push('<div class="reply">')
    thread.push(`<form id="reportReply${j}" style="display:inline">`);
    thread.push(`<input type="hidden" name="thread_id" value="${ele._id}">`);
    thread.push(`<input type="hidden" name="reply_id" value="${rep._id}">`)
    thread.push(`<input type="hidden" id="reply_report_value${j}" name="reply_report_value" value="${rep.reported}">`);
    thread.push(`<button id="reportReplyBtn${j}" title=${rep.reported? "Starred" : "Unstarred"} style="width:35px;height:22px">${rep.reported? "&#11088;" : "&#9734;"}</button>`);
    thread.push(`</form>`);
    thread.push('&nbsp;<p class="id" style="display:inline"><b>Reply id</b>: '+rep._id+' ('+ formatDate(rep.created_on) +')</p>&nbsp;');
    thread.push(`<form id="deleteReply${j}" style="display:inline"><input type="hidden" value="${ele._id}" name="thread_id" required=""><input type="hidden" value="${rep._id}" name="reply_id" required=""><input type="text" placeholder="password" size="8" name="delete_password" required=""><input type="submit" value="Delete reply"></form>`);
    thread.push(`<p id="replyText${j}">${rep.text}</p>`);
    thread.push('</div>')
       $('#boardDisplay').on('submit',`#reportReply${j}`, function(e) {
          var url = "/api/replies/"+currentBoard;
          $.ajax({
            type: "PUT",
            url: url,
            data: $(this).serialize(),
            success: function(data) {
              // alert(data)
              if (data.setTo === true) {
                $(`#reportReplyBtn${j}`).html("&#11088;"); // yellow star
                $(`#reportReplyBtn${j}`).attr('title', 'Starred');
                $(`#reply_report_value${j}`).val(true);
              } else {
                $(`#reportReplyBtn${j}`).html("&#9734;"); // white star
                $(`#reportReplyBtn${j}`).attr('title', 'Unstarred');
                $(`#reply_report_value${j}`).val(false);
              }
            }
          });
          e.preventDefault();
        });
       $('#boardDisplay').on('submit',`#deleteReply${j}`, function(e) {
          var url = "/api/replies/"+currentBoard;
          $.ajax({
            type: "DELETE",
            url: url,
            data: $(this).serialize(),
            success: function(data) {
              // alert(data) 
              $(`#replyText${j}`).text('DELETED');
            }
          });
          e.preventDefault();
        });  
  });
  thread.push('<div class="newReply">')
  thread.push('<form action="/api/replies/'+currentBoard+'/" method="post" id="newReply">');
  thread.push('<input type="hidden" name="thread_id" value="'+ele._id+'">');
  thread.push('<textarea rows="3" cols="80" type="text" placeholder="New reply text..." name="text" required=""></textarea><br>');
  thread.push('<input type="text" placeholder="password to delete" name="delete_password" required=""><input style="margin-left: 5px" type="submit" value="Create reply">')
  thread.push('</form></div></div></div>')
          $('#boardDisplay').on('submit',`#reportThread${i}`, function(e) {
          var url = "/api/threads/"+currentBoard;
          $.ajax({
            type: "PUT",
            url: url,
            data: $(this).serialize(),
            success: function(data) {
              // alert(data) 
              if (data.setTo === true) {
                $(`#reportThreadBtn${i}`).html("&#11088;"); // yellow star
                $(`#reportThreadBtn${i}`).attr('title', 'Starred');
                $(`#report_value${i}`).val(true);
              } else {
                $(`#reportThreadBtn${i}`).html("&#9734;"); // white star
                $(`#reportThreadBtn${i}`).attr('title', 'Unstarred');
                $(`#report_value${i}`).val(false);
              }
            }
          });
          e.preventDefault();
        });
  
  return thread.join('');
}