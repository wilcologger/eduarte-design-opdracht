
(function ($) {
var scroller = null,
scrollerOffset;

function freezePanes(table, fixedColumns) {
var leftPane = null,	
 topPane = null, 
 topLeftPane = null,	
 header = table.find('thead'),
headerHeight = header.height(),
tableHeight = table.height();
function onScroll() {
var headerOffset = header.offset(),
scroll = { left: scroller.scrollLeft(), top: scroller.scrollTop() };

 
 if (headerOffset.top < scrollerOffset.top
&& headerOffset.top + tableHeight > scrollerOffset.top) {
if (!topPane)
topPane = createFreezedPane(table, 'thead', '*').addClass('topPane');

 topPane.css('left', headerOffset.left - scrollerOffset.left + 'px');
topPane.show();
}
else if (topPane) {
topPane.hide();
}

 
 if (fixedColumns > 0 && headerOffset.left < scrollerOffset.left
&& headerOffset.top + tableHeight > scrollerOffset.top) {
if (!leftPane)
leftPane = createFreezedPane(table, 'tbody', ':lt(' + fixedColumns + ')').addClass('leftPane');
leftPane.css('top', headerOffset.top - scrollerOffset.top + headerHeight + 'px');
leftPane.show();
if (!topLeftPane)
topLeftPane = createFreezedPane(table, 'thead', ':lt(' + fixedColumns + ')').addClass('topLeftPane');
topLeftPane.css('top', Math.max(headerOffset.top - scrollerOffset.top, 0));
topLeftPane.show();
}
else {
if (leftPane)
leftPane.hide();
if (topLeftPane)
topLeftPane.hide();
}
}

function onAjax(jqEvent, attributes, jqXHR, errorThrown, textStatus) {
scroller.off('scroll', onScroll);
Wicket.Event.unsubscribe('/ajax/call/complete', onAjax);
if (leftPane) leftPane.remove();
if (topPane) topPane.remove();
if (topLeftPane) topLeftPane.remove();
$('#' + table.attr('id')).freezePanes(fixedColumns);
}
scroller.scroll(onScroll);
if (table.attr('id'))
Wicket.Event.subscribe('/ajax/call/complete', onAjax);
onScroll();
}

function createFreezedPane(table, tableSection, columnSelector) {
var pane = $('<table>');

 $.each(table.prop("attributes"), function () {
if (this.name !== "id") {
pane.attr(this.name, this.value);
}
});
pane.addClass('freezedPane');

 var section = $('<' + tableSection + '>');

 var clonedRows = table.find(tableSection + '>tr')
.map(function () {
var tr = $('<tr>');
$(this).children().filter(columnSelector).each(function (index, element) {
var td = clone(element);
tr.append(td);
});
tr.outerHeight(this.getBoundingClientRect().height);
return tr;
}).get();
section.append(clonedRows);
pane.append(section);

 scroller.prepend(pane);

 var width = 0;
section.find('tr:first>*').each(function (index) {
var cellWidth = table.find('tr:first>*')[index].getBoundingClientRect().width;
$(this).outerWidth(cellWidth);
width += cellWidth;
});
pane.css('width', width + 'px');
return pane;
}

function clone(element) {

 var copy = element.cloneNode(false);
if (copy instanceof Element) {

 copy.removeAttribute('id');
copy.removeAttribute('name');
}
if (copy.tagName === 'INPUT') {
if (copy.type === 'checkbox') {
copy.addEventListener('click', function () {
element.checked = copy.checked;

 element.dispatchEvent(new Event('click'));
});
} else {
copy.addEventListener('change', function () {
element.value = copy.value;

 element.dispatchEvent(new Event('change'));
});
}
}
Array.prototype.forEach.call(element.childNodes, function(child)
{
copy.appendChild(clone(child));
});
return copy;
}

	$.fn.freezePanes = function (fixedColumns) {
if (!scroller) {
scroller = $('#scrollBox');
scrollerOffset = scroller.offset();
}
return this.filter('table').each(function (i, e) {
freezePanes($(e), fixedColumns);
});
};
})(jQuery);
