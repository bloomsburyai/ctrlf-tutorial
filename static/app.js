const TOKEN = 'tutorialCtrlF';//to obtain your public token login and click on the wheel icon
const ANSWER_API_URL = 'https://responder.thecape.ai/api/0.1/answer?token=' + TOKEN; // TOKEN should be a URL parameter
const NUM_RESULTS = 3; //the number of answers we want the API to respond

$(document).ready(function () {
    //wait for user to write a question and call the api
    $('#ctrlfField').bind('input propertychange', _.debounce(callAnswerApi, 300));
    $('#ctrlfField').trigger('propertychange');//initial question trigger
});

function callAnswerApi(event) {
    event.preventDefault();//we block html form submission
    //We post to the API URL the question and the text extracted from the webpage.
    //We then call the showAnswers() function on success.
    $.post(ANSWER_API_URL,
        {'question': $('#ctrlfField').val(), 'text': $('#documentText').text(), 'numberOfItems': NUM_RESULTS},
        showAnswers).fail(showLimit).always(removeLoadingAnimation);
    $('#ctrlfField').addClass('loading');//we show a loading animation
    $('#ctrlfWarning').hide();//hide warning in case it was shown before
}

function showAnswers(apiResponse) {
    var answers = apiResponse['result']['items'];
    var answer = {};
    var range = [];
    var doc_text = $('#documentText');
    var table_content = [];
    doc_text.unmark();
    for (i = 0; i < answers.length; i++) {
        answer = answers[i];
        range = {
            'start': answer.answerTextStartOffset,
            'length': (answer.answerTextEndOffset - answer.answerTextStartOffset)
        };
        if (i === 0) {
            doc_text.markRanges([range], {element: 'span', className: 'success'})
        } else if (i < 4) {
            doc_text.markRanges([range], {element: 'span', className: 'info'})
        } else {
            doc_text.markRanges([range], {element: 'span', className: 'danger'})
        }
        table_content.push([answer.answerText, answer.answerContext, answer.confidence])
    }
    //We show a table with the results
    $('#results-table').DataTable({
        data: table_content,
        columns: [
            {title: "Answer"},
            {title: "Context"},
            {title: "Confidence"}
        ],
        ordering: false,
        paging: false,
        searching: false,
        info: false
    });
}

function showLimit() {
    $('#ctrlfWarning').show();//When the user submits too many requests or too much text we show a warning
}

function removeLoadingAnimation() {
    $('#ctrlfField').removeClass('loading'); // we remove the loading animation
}