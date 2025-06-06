import paramiko

def execute_remote_command(hostname=None, port=22 , username=None , password=None , command=None):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=hostname , port=port , username=username , password=password)
        stdin , stdout , stderror = ssh.exec_command(command)
        output= stdout.read().decode()
        error = stderror.read().decode()
        ssh.close()

        return {"output":output.strip() , "error":error.strip()}
    
    except Exception as e:
        return {"error": str(e)}