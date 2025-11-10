$(function () {
  function recalcProgress() {
    const total = $(".task-checkbox").length;
    const checked = $(".task-checkbox:checked").length;
    const percent = total ? Math.round((checked / total) * 100) : 0;
    $("#progress-percent").text(percent + "%");
  }

  // Enforce sequential order & cascade uncheck
  $(".task-checkbox").on("change", function () {
    const id = parseInt($(this).data("id"), 10);
    const isChecked = $(this).is(":checked");
    const $label = $(this).siblings(".task-text");

    if (isChecked) {
      // Block if any previous item is unchecked
      let valid = true;
      $(".task-checkbox").each(function () {
        const otherId = parseInt($(this).data("id"), 10);
        if (otherId < id && !$(this).is(":checked")) valid = false;
      });
      if (!valid) {
        alert("You must complete all previous items first.");
        $(this).prop("checked", false);
        return;
      }
      $label.addClass("checked");
    } else {
      $label.removeClass("checked");
      // Uncheck everything below (UI first for responsiveness)
      $(".task-checkbox").each(function () {
        const otherId = parseInt($(this).data("id"), 10);
        if (otherId > id) {
          $(this).prop("checked", false);
          $(this).siblings(".task-text").removeClass("checked");
        }
      });
      // Tell server to clear the states below
      $.ajax({
        url: "/uncheck_below",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ id }),
      });
    }

    // Update this item on server
    $.ajax({
      url: "/update",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ id, checked: isChecked }),
      complete: recalcProgress,
    });
  });

  // Initial % render
  recalcProgress();
});
