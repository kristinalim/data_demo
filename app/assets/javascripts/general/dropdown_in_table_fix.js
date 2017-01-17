$(function() {
  $(document).on('show.bs.dropdown', function(e) {
    dropdownMenu = $(e.target).find('.dropdown-menu');
    $('body').append(dropdownMenu.detach());

    var target = $(e.target);
    var offset = target.offset();

    target.data('dropdownMenu', dropdownMenu);

    dropdownMenu.css({
      display: 'block',
      top: offset.top + target.outerHeight(),
      left: offset.left
    });
  });

  $(window).on('hide.bs.dropdown', function(e) {
    var target = $(e.target);
    var dropdownMenu = target.data('dropdownMenu');

    dropdownMenu.hide();
    target.append(dropdownMenu.detach());
  });
});
