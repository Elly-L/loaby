import json
import os
from supabase import create_client, Client

supabase_url = 'https://rqbbiezwdxquijlqxjjg.supabase.co'
supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

def handler(event, context):
    if event['httpMethod'] == 'POST':
        body = json.loads(event['body'])
        file = body['file']
        caption = body['caption']
        userId = body['userId']

        # Upload file to Supabase Storage
        file_path = f"{userId}/{file['name']}"
        response = supabase.storage.from_('media').upload(file_path, file['content'], file_options={'cacheControl': '3600', 'upsert': False})

        if response.get('error'):
            return {
                'statusCode': 500,
                'body': json.dumps({'error': response['error']['message']})
            }

        # Insert file metadata into the database
        insert_response = supabase.table('media').insert([{'path': response['Key'], 'caption': caption, 'user_id': userId}]).execute()

        if insert_response.get('error'):
            return {
                'statusCode': 500,
                'body': json.dumps({'error': insert_response['error']['message']})
            }

        return {
            'statusCode': 200,
            'body': json.dumps(insert_response['data'])
        }
    else:
        return {
            'statusCode': 405,
            'body': 'Method Not Allowed'
        }
