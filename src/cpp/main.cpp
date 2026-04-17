#include <iostream>
#include <thread>
#include <string>
#include <windows.h>

#include "json.hpp"
#include "Recorder.h"
#include "Player.h"

#define WM_START_RECORDING (WM_USER + 1)
#define WM_STOP_RECORDING  (WM_USER + 2)
#define WM_EXIT            (WM_USER + 3)

using json = nlohmann::json;


void respond(const json& msg)
{
    std::cout << msg.dump() << "\n";
    std::cout.flush();
}


void stdinLoop(DWORD mainThreadId)
{
    std::string line;
    while (std::getline(std::cin, line))
    {
        if (line.empty()) 
            continue;

        try
        {
            json cmd = json::parse(line);
            std::string action = cmd["cmd"];

            if (action == "startRecording")
            {
                // tell main thread to register the hook
                PostThreadMessage(mainThreadId, WM_START_RECORDING, 0, 0);
            }
            else if (action == "stopRecording")
            {
                // tell main thread to unregister the hook
                PostThreadMessage(mainThreadId, WM_STOP_RECORDING, 0, 0);
            }
            else if (action == "playback")
            {
                std::string file = cmd["file"];
                Player::instance().load(file);
                Player::instance().play();
                respond({ {"status", "done"} });
            }
            else if (action == "exit")
            {
                PostThreadMessage(mainThreadId, WM_EXIT, 0, 0);
                break;
            }
        }
        catch (const std::exception& e)
        {
            respond({ {"error", e.what()} });
        }
    }

    PostQuitMessage(0);
}


int main()
{
    std::cerr << "macro_engine starting...\n";

    DWORD mainThreadId = GetCurrentThreadId(); // grab before spawning thread

    std::thread inputThread(stdinLoop, mainThreadId);

    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0))
    {
        if (msg.message == WM_START_RECORDING)
        {
            Recorder::instance().start(); // hook registered on main thread ✓
            respond({ {"status", "recording"} });
        }
        else if (msg.message == WM_STOP_RECORDING)
        {
            Recorder::instance().stop();
            json events = Recorder::instance().getEventsAsJson();
            respond({ {"status", "stopped"}, {"events", events} });
        }
        else if (msg.message == WM_EXIT)
        {
            PostQuitMessage(0);
        }
        else
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
    }

    inputThread.join();
    return 0;
}
