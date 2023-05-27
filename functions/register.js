const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();
const ulid = require('ulid');

const { STUDENTS_TABLE } = process.env

module.exports.handler = async (event) => {
  const { 
    first,
    last,
    email,
    phone,
    birthdate } = event.arguments.student;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const existingStudent = await DocumentClient.query({
    TableName: STUDENTS_TABLE,
    IndexName: 'byEmail',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    },
    Limit: 1
  }).promise();

  if( existingStudent.Items && existingStudent.Items.length > 0 ) {
    throw new Error('Student already exists');
  }

  const newStudent = {
    id,
    location: 'DIVA',
    first,
    last,
    email,
    phone,
    birthdate,
    createdAt: timestamp
  };

  await DocumentClient.transactWrite({
    TransactItems: [{
      Put: {
        TableName: STUDENTS_TABLE,
        Item: newStudent
      }
    }]
  }).promise();

  return newStudent;
};