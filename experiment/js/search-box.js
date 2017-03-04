function createSearch(el, data, key, group) {
    var groups = _.groupBy(data, group);
    var searchData = Object.keys(groups).map(function (g) {
        return {
            text: g,
            children: groups[g].map(function (d) {
                return {
                    id: d[key],
                    text: d[key]
                }
            })
        }
    });
    //Object.keys(groups).forEach(function(g) {
    //    var optGroup = el.append($("<optgroup>").attr('label', g).text(g));
    //    groups[g].forEach(function(d) {
    //        $("<option>").attr("value", d[key]).text(d[key]).appendTo(optGroup);
    //
    //    });
    //});
    $(el).select2({
        data: searchData,
        placeholder: 'Search',
        allowClear: true
    });

}