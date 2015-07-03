(function($) {
    var animation = 'tada',
        update = 'rubberBand',
        intervalCount = 0;
    var rpc = new lista.plugin.rpc('1234', ['save'], false);
    fetch();
    var interval = setInterval(fetch, 2500);
    $(window).load(function() {
        $('.card').removeClass(animation + ' animated').on('mouseenter click', toggle);
    });
    function toggle() {
        var img = $(this).find('img');
        img.removeAttr('alt');
        rpc.call('save', {
            method : 'save',
            params : {score:img.data('score')},
            complete : toggleupdate
        });
        animate(this, animation);
    }
    function toggleupdate(rpc, status) {
        if (status === 'success') {
            if ($('#friberg .score span').html() != rpc.get(0, 'friberg')) {
                animate('#friberg .score span', update);
            }
            $('#friberg .score span').html(rpc.get(0, 'friberg'));
            $('#friberg2').css('width', ((rpc.get(0, 'friberg') / rpc.get(0, 'total')) * 100) + '%');

            if ($('#pasha .score span').html() != rpc.get(0, 'pasha')) {
                animate('#pasha .score span', update);
            }
            $('#pasha .score span').html(rpc.get(0, 'pasha'));
            $('#pasha2').css('width', ((rpc.get(0, 'pasha') / rpc.get(0, 'total')) * 100) + '%');
        }
    }
    function animate(o, animation) {
        $(o).removeClass(animation + ' animated').addClass(animation + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(o).removeClass(animation + ' animated');
        });
    }
    function fetch() {
        intervalCount++;
        if (intervalCount > 20) {
            clearInterval(interval);
        }
        rpc.call('save', {
            method : 'save',
            params : {score:0},
            complete : toggleupdate
        });
    }
}(jQuery));
