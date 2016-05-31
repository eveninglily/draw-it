class SliderVar {
    constructor(id) {
        this.id = id;
        this.value = $('#' + id).val();

        $('#' + id).on('input', function () {
            $('#' + id + '-value').val($(this).val());
            this.value = $(this).val();
        });

        $('#' + id + '-value').on('input', function () {
            $('#' + id).val($(this).val());
            this.value = $(this).val();
        });
    }
}