// keyEvent.h

#pragma once
#include <windows.h>

/*******************************************************
 * STRUCT - KeyEvent
 * -----------------------------------------------------
 * This struct
********************************************************/

struct KeyEvent
{
    DWORD vkCode;
    bool  keyDown;
    DWORD timestamp;

    KeyEvent() : vkCode(0), keyDown(false), timestamp(-1) {}
    KeyEvent(DWORD vkCode, bool keyDown, DWORD timestamp)
    : vkCode(vkCode), keyDown(keyDown), timestamp(timestamp) {}
};