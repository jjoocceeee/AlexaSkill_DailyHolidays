const Alexa = require('ask-sdk-core');
const axios = require('axios');
const _ = require('lodash');


async function getTodayHolidays(handlerInput){
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    const { intent } = requestEnvelope.request;
          console.log("Getting todays intent");
      let response = await axios({
        url: 'HOLIDAY_URL_FOUND_IN_BLOG',
        method: 'post',
        data: {
          query: `
            query
            {
            holidaysToday{
              name
              }
            }
            `
        }
      });
      let holidayText = 'Todays holidays are';
      if(response.data.length < 1){
        holidayText='There are no holidays today. We can celebrate you instead?';
        return holidayText;
      } else {
        console.log("Response from api call: ", response.data.data.holidaysToday);
        _.forEach(response.data.data.holidaysToday, (day)=>{
          holidayText+= " " + day.name + ",";
        });
      }
        return handlerInput.responseBuilder.speak(holidayText).getResponse();

};




const TodaysHolidayIntentHandler = {
    canHandle(handlerInput){
        
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'TodaysHolidayIntent';
    },
    async handle(handlerInput) {

      return await getTodayHolidays(handlerInput);
    }
};




const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
return handlerInput.responseBuilder
        .speak('I don\'t know why we are getting here.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
    },
};



// The lambda handler is the entry point for the AWS lambda function.

let skill;

exports.handler = async function (event, context) {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        TodaysHolidayIntentHandler
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }
    //console.log("Event: ", event);
  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`);

  return response;
};