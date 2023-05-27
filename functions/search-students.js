const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const { STUDENTS_TABLE } = process.env

module.exports.handler = async (event) => {
  const {name} = event.arguments;

  const studentsFirstResp = await DocumentClient.query({
    TableName: STUDENTS_TABLE,
    IndexName: 'byFirstName',
    KeyConditionExpression: '#location = :location and begins_with(#first, :first)',
    ExpressionAttributeNames: {
      '#first': 'first',
      '#location': 'location'
    },
    ExpressionAttributeValues: {
      ':first': name,
      ':location': 'DIVA'
    },
    Limit: 25
  }).promise();

  const students = studentsFirstResp.Items || [];

  const existingStudentsLast = await DocumentClient.query({
    TableName: STUDENTS_TABLE,
    IndexName: 'byLastName',
    KeyConditionExpression: '#location = :location and begins_with(#last, :last)',
    ExpressionAttributeNames: {
        '#last': 'last',
        '#location': 'location'
    },
    ExpressionAttributeValues: {  
      ':last': name,
      ':location': 'DIVA'
    },
    Limit: 25
  }).promise();

  existingStudentsLast.Items.forEach(student => {
    if( !students.find((x) => x.id === student.id) ) {
        students.push(student);
    }
  });

  console.log(students);

  return {students};
};