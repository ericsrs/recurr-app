/*******************************************************
 * createMacro.cpp
 * -----------------------------------------------------
 * This script saves user input and outputs the information
 *  to the console as json.
********************************************************/

#include <iostream>  /* cout        */
#include <windows.h> /* HHOOK       */   
#include <chrono>    /* clock       */
#include <vector>    /* std::vector */

using namespace std; /* cout, endl  */

/****************** PROTOTYPES ******************/
LRESULT CALLBACK KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam);
void outputEventsAsJson();
/************************************************/


struct KeyEvent
{
    DWORD vkCode;    // key code #
    bool  keyDown;   // true = key down, false = key up
    int   timestamp; //
    
    KeyEvent() : vkCode(DWORD()), keyDown(0), timestamp(-1)  {} // Default Constructor
    KeyEvent(DWORD vkCode, bool keyDown, int timestamp) 
    : vkCode(vkCode), keyDown(keyDown), timestamp(timestamp) {} // Overloaded Constructor
};


HHOOK hook; // Global Keyboard Hook
vector<KeyEvent> recordedKeyEvents; // keyEvents enacted by user
 

int main()
{
    cerr << "Begin createMacro.cpp...\n";

    hook = SetWindowsHookEx(
        WH_KEYBOARD_LL,
        KeyboardProc,
        GetModuleHandle(nullptr),
        0
    );


    if (!hook)
    {
        cerr << "Failed to install hook\n";
        return 1;
    }

    // Loop to listen for input
    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    // Unhook before exiting
    UnhookWindowsHookEx(hook);

    outputEventsAsJson();
    return 0;
}


LRESULT CALLBACK KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode == HC_ACTION)
    {
        KBDLLHOOKSTRUCT* keyData = (KBDLLHOOKSTRUCT*)lParam;

        if (wParam == WM_KEYDOWN)
        {
            cerr << "Key down: " << keyData->vkCode;

            KeyEvent event(keyData->vkCode, true, -1);

            if (keyData->vkCode == VK_ESCAPE)
            {
                cerr << "Exiting script...\n";
                PostQuitMessage(0);
            }
            else
            {
                recordedKeyEvents.push_back(event);
            }
        }
    }

    return CallNextHookEx(hook, nCode, wParam, lParam);
}


void outputEventsAsJson()
{
    cout << "[";

    for (size_t i = 0; i < recordedKeyEvents.size(); ++i)
    {
        cout << "{ ";
        cout << "\"vkCode\": "    << recordedKeyEvents[i].vkCode    << ", ";
        cout << "\"keyDown\": "   << recordedKeyEvents[i].keyDown   << ", ";
        cout << "\"timestamp\": " << recordedKeyEvents[i].timestamp;
        cout << " }";

        // Add a , between events
        if (i != recordedKeyEvents.size() - 1)
        {
            cout << ",";
        }
    }

    cout << "]";
    cout.flush();
}