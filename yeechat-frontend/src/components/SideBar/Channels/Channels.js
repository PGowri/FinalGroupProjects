import React, { useState, useEffect } from 'react';
import './Channels.css';
import { Menu, Icon, Modal, Button, Form, Segment } from 'semantic-ui-react';
import {getChannelsFromWorkspace, createChannelInWorkspace} from "../../../api/channelApi";

const userId = sessionStorage.getItem('userId');
const workspaceId = sessionStorage.getItem('workspaceId');

const Channels = (props) => {
    const [modalOpenState, setModalOpenState] = useState(false);
    const [channelAddState, setChannelAddState] = useState({ name: ''});
    const [isLoadingState, setLoadingState] = useState(false);
    const [channels, setChannels] = useState([]);

    const openModal = () => { setModalOpenState(true); }
    const closeModal = () => { setModalOpenState(false); }

    const displayChannels = () => {
        getChannelsFromWorkspace(workspaceId)
            .then(data => {
                console.log('Raw API data:', data);
                if (Array.isArray(data)) {
                    setChannels(data);
                } else {
                    console.log('Data is not an array:', data);
                    setChannels([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching channels:', error);
            });
    }

    useEffect(() => {
        const handleWorkspaceChange = () => {
            const newWorkspaceId = sessionStorage.getItem('workspaceId');
            if (newWorkspaceId !== workspaceId) {
                refreshChannels();
            }
        };

        window.addEventListener('workspaceSelect', handleWorkspaceChange);
        displayChannels();
        return () => {
            window.removeEventListener('workspaceSelect', handleWorkspaceChange);
        };
    }, []);

    const refreshChannels = () => {
        getChannelsFromWorkspace(workspaceId)
            .then(data => {
                setChannels(data);
            })
            .catch((error) => {
                console.error('Error fetching channels:', error);
            });
    }

    useEffect(() => {
        displayChannels();
    }, []);

    const onSubmit = (event) => {
        event.preventDefault();

        if (!channelAddState.channelName) {
            console.log("Form is not valid");
            return;
        }

        const channel = {
            channelName: channelAddState.channelName,
            accessibility: true,
            visible: true,
            workspaceId: workspaceId
        };

        console.log("Submitting channel:", channel);

        createChannelInWorkspace(workspaceId, channel)
            .then(data => {
                console.log('Success:', data);
                closeModal();
                refreshChannels();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };


    const handleInput = (e) => {
        const { name, value } = e.target;
        setChannelAddState((currentState) => {
            return { ...currentState, [name]: value };
        });
    }

    const handleChannelClick = (channelId) => {
        console.log(`Redirect to channel ${channelId}`);
        displayMessages(channelId);
    };

    const displayMessages = (channelId) => {
        const dataContainer = document.getElementById('message-container');
        dataContainer.innerHTML = '';

        fetch(`http://localhost:8080/api/messages/channel/${channelId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                const dataContainer = document.getElementById('message-container');
                data.forEach(item => {
                    const itemElement = document.createElement('div');
                    const itemElement2 = document.createElement('div')

                    const formattedDate = new Date(item.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });

                    itemElement.textContent = `${formattedDate.replace(/\//g, '-')} ${sessionStorage.getItem('username') ?? "Sudo Kode"}`;
                    itemElement2.textContent = `${item.body}`
                    dataContainer.appendChild(itemElement);
                    dataContainer.appendChild(itemElement2);
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                // TODO: Send an error message to the user
            });
    }

    return <> <Menu.Menu style={{ marginTop: '20px' }}>
        <Menu.Item style={{fontSize : '17px'}}>
            <span>
                <Icon name="exchange" /> Channels
            </span>
            ({channels.length})
        </Menu.Item>
        {channels.map(channel => (
            <Menu.Item key={channel.channelId} onClick={() => handleChannelClick(channel.channelId)}>
                {channel.channelName}
            </Menu.Item>
        ))}
        <Menu.Item>
            <span className="clickable" onClick={openModal} >
                <Icon name="add" /> New Channel
            </span>
        </Menu.Item>
    </Menu.Menu>
        <Modal open={modalOpenState} onClose={closeModal}>
            <Modal.Header>
                Create Channel
            </Modal.Header>
            <Modal.Content>
                <Form onSubmit={onSubmit}>
                    <Segment stacked>
                        <Form.Input
                            name="channelName"
                            value={channelAddState.channelName}
                            onChange={handleInput}
                            type="text"
                            placeholder="Enter Channel Name"
                        />
                    </Segment>
                    <Button loading={isLoadingState} type="submit">
                        <Icon name="checkmark" /> Save
                    </Button>
                    <Button onClick={closeModal}>
                        <Icon name="remove" /> Cancel
                    </Button>
                </Form>
            </Modal.Content>
        </Modal>
    </>
}

export default Channels;