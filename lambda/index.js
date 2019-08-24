const Alexa = require('ask-sdk-core');
const axios = require('axios');
const _ = require('lodash');


async function getTodayHolidays(handlerInput){
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    const { intent } = requestEnvelope.request;
          console.log("Getting todays intent");
      let response = await axios({
        url: 'https://limitless-island-47396.herokuapp.com/graphql',
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
        console.log("There are no holidays today?!?");
        holidayText='There are no holidays today. We can celebrate you instead?';
        return holidayText;
      } else {
        console.log("Response from api call: ", response.data.data.holidaysToday);
        _.forEach(response.data.data.holidaysToday, (day)=>{
          console.log("Holiday: ", day.name);
          holidayText+= " " + day.name + ",";
          // holidayText.append(" " + day);
        });
      }
        console.log("Text at the end: ", holidayText);
        // TODO: Stringify the text.
        return handlerInput.responseBuilder.speak(holidayText).getResponse();
        // return holidayText;

};



const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to the Celebratation Skill. Ask what holidays are on a certain date!';
return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const TodaysHolidayIntentHandler = {
    canHandle(handlerInput){
        
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'TodaysHolidayIntent';
    },
    async handle(handlerInput) {

      return await getTodayHolidays(handlerInput);
    }
};


const dateIntentHandler = {
  canHandle(handlerInput){
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.SearchAction<object@Calendar>';
  },
  async handle(handlerInput) {
    console.log("Search Calendar intent.");
    console.log("Get holidays for: ", handlerInput);
    return await getTodayHolidays(handlerInput);
  }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
        
    },
    handle(handlerInput) {
        const speechText = 'Hello World';
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!';
return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
return handlerInput.responseBuilder
        .speak('JoCee, I don\'t know why we are getting here.')
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
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        TodaysHolidayIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        dateIntentHandler
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }
    //console.log("Event: ", event);
  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`);

  return response;
};