import 'client/css/UserIcon.css'
import * as React from 'react';
import { User } from 'types';

interface UserIconProps {
  user: User;
}

// TODO: Add support for profile pics when we have actual users
class UserIcon extends React.Component<UserIconProps, {}> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return <div className='userIcon'>
        {this.props.user.name[0]}
    </div>
  }
}

export default UserIcon;
